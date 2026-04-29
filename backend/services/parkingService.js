const { client: db } = require("../db/database");
const schemaCache = new Map();

async function execute(sql, args = []) {
  return db.execute({ sql, args });
}

function getRows(result) {
  return Array.isArray(result?.rows) ? result.rows.map((row) => ({ ...row })) : [];
}

async function all(sql, args = []) {
  const result = await execute(sql, args);
  return getRows(result);
}

async function one(sql, args = []) {
  const rows = await all(sql, args);
  return rows[0] || null;
}

function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
}

/**
 * Checks if a slot has any booking conflict for the given time range.
 * Logic: (new_start < existing_end) AND (new_end > existing_start)
 */
async function hasBookingConflict(slotId, startTime, endTime) {
  const conflict = await one(
    `
      SELECT id FROM bookings
      WHERE slot_id = ?
        AND status = 'active'
        AND (? < end_time AND ? > start_time)
      LIMIT 1
    `,
    [slotId, startTime, endTime]
  );
  return !!conflict;
}

async function releaseExpiredBookings() {
  const now = new Date().toISOString();

  // Mark bookings as expired if end_time has passed and they are still 'active' (not yet occupied)
  const expiredBookings = await all(
    `
      SELECT id, slot_id
      FROM bookings
      WHERE status = 'active'
        AND end_time < ?
    `,
    [now]
  );

  for (const booking of expiredBookings) {
    await execute(
      `UPDATE bookings SET status = 'expired' WHERE id = ?`,
      [booking.id]
    );

    // Only set slot to available if it was 'booked' (not 'occupied')
    await execute(
      `UPDATE slots SET status = 'available' WHERE id = ? AND status = 'booked'`,
      [booking.slot_id]
    );
  }

  if (expiredBookings.length > 0) {
    console.log(`[parkingService] Released ${expiredBookings.length} expired booking(s)`);
  }
  return expiredBookings.length;
}

async function findUserByRfid(rfid) {
  return one(
    `SELECT * FROM users WHERE rfid = ? LIMIT 1`,
    [rfid]
  );
}

async function findActiveBookingForUser(userId) {
  const now = new Date().toISOString();
  return one(
    `
      SELECT b.*, s.slot_number, s.level
      FROM bookings b
      JOIN slots s ON b.slot_id = s.id
      WHERE b.user_id = ?
        AND b.status = 'active'
        AND ? BETWEEN b.start_time AND b.end_time
      LIMIT 1
    `,
    [userId, now]
  );
}

async function getAvailableSlotsForTime(startTime, endTime) {
  const allSlots = await all(`SELECT * FROM slots ORDER BY id ASC`);
  const available = [];

  for (const slot of allSlots) {
    // A slot is available if its status is 'available' AND it has no booking conflicts
    if (normalizeStatus(slot.status) === 'available') {
      const conflict = await hasBookingConflict(slot.id, startTime, endTime);
      if (!conflict) {
        available.push(slot);
      }
    }
  }
  return available;
}

async function createPreBooking({ userId, slotId, startTime, durationHours }) {
  await releaseExpiredBookings();

  const start = new Date(startTime);
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

  const startIso = start.toISOString();
  const endIso = end.toISOString();

  // 1. Check for conflicts
  const conflict = await hasBookingConflict(slotId, startIso, endIso);
  if (conflict) {
    throw new Error("Slot is already booked for the selected time range.");
  }

  // 2. Check if user already has an overlapping booking
  const userConflict = await one(
    `
      SELECT id FROM bookings
      WHERE user_id = ?
        AND status = 'active'
        AND (? < end_time AND ? > start_time)
      LIMIT 1
    `,
    [userId, startIso, endIso]
  );
  if (userConflict) {
    throw new Error("You already have another booking during this time.");
  }

  await execute(
    `
      INSERT INTO bookings (user_id, slot_id, start_time, end_time, status)
      VALUES (?, ?, ?, ?, 'active')
    `,
    [userId, slotId, startIso, endIso]
  );

  return {
    slotId,
    startTime: startIso,
    endTime: endIso,
    status: 'active'
  };
}

async function assignSlotFromRfid(rfid) {
  console.log(`[parkingService] RFID scan received: ${rfid}`);
  await releaseExpiredBookings();

  const user = await findUserByRfid(rfid);
  const now = new Date().toISOString();
  const oneHourLater = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  if (user) {
    console.log(`[parkingService] User found: ${user.name} (ID: ${user.id})`);
    const activeBooking = await findActiveBookingForUser(user.id);

    if (activeBooking) {
      console.log(`[parkingService] Active booking found for slot ${activeBooking.slot_number}`);
      await execute(`UPDATE slots SET status = 'booked' WHERE id = ?`, [activeBooking.slot_id]);
      return {
        message: `Welcome ${user.name}`,
        slot: activeBooking.slot_number,
        status: "assigned",
      };
    }
  } else {
    console.log(`[parkingService] RFID ${rfid} not linked to any user. Treating as guest.`);
  }

  // No active booking or guest user
  const availableSlots = await getAvailableSlotsForTime(now, oneHourLater);

  if (availableSlots.length > 0) {
    const selectedSlot = availableSlots[0]; // Serial order
    console.log(`[parkingService] Assigning available slot ${selectedSlot.slot_number}`);

    await execute(`UPDATE slots SET status = 'booked' WHERE id = ?`, [selectedSlot.id]);
    await execute(
      `
        INSERT INTO bookings (user_id, slot_id, start_time, end_time, status)
        VALUES (?, ?, ?, ?, 'active')
      `,
      [user ? user.id : null, selectedSlot.id, now, oneHourLater]
    );

    return {
      message: user ? `Welcome ${user.name}` : "Welcome Guest",
      slot: selectedSlot.slot_number,
      status: "assigned",
    };
  }

  console.log("[parkingService] Parking Full");
  return {
    message: "Parking Full",
    slot: null,
    status: "full",
  };
}

async function updateSlotFromIr({ slotId, occupied }) {
  await releaseExpiredBookings();

  const slot = await one(`SELECT * FROM slots WHERE id = ?`, [slotId]);
  if (!slot) throw new Error("Slot not found.");

  if (occupied) {
    await execute(`UPDATE slots SET status = 'occupied' WHERE id = ?`, [slotId]);
    // Mark the overlapping active booking as occupied
    const now = new Date().toISOString();
    await execute(
      `
        UPDATE bookings
        SET status = 'occupied'
        WHERE slot_id = ?
          AND status = 'active'
          AND ? BETWEEN start_time AND end_time
      `,
      [slotId, now]
    );
  } else {
    await execute(`UPDATE slots SET status = 'available' WHERE id = ?`, [slotId]);
    // Mark current occupied booking as completed
    await execute(
      `
        UPDATE bookings
        SET status = 'completed'
        WHERE slot_id = ?
          AND status = 'occupied'
      `,
      [slotId]
    );
  }

  return {
    slot: slot.slot_number,
    status: occupied ? "occupied" : "available"
  };
}

async function getAllSlots() {
  await releaseExpiredBookings();
  return all(`SELECT * FROM slots ORDER BY id ASC`);
}

module.exports = {
  assignSlotFromRfid,
  createPreBooking,
  getAllSlots,
  updateSlotFromIr,
  hasBookingConflict
};
