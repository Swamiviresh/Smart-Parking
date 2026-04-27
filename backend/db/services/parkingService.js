const db = require("../db");

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

function addHoursToNow(hours) {
  const next = new Date();
  next.setHours(next.getHours() + hours);
  return next.toISOString();
}

async function getTableSchema(tableName) {
  if (schemaCache.has(tableName)) {
    return schemaCache.get(tableName);
  }

  const result = await db.execute(`PRAGMA table_info(${tableName})`);
  const schema = getRows(result);
  schemaCache.set(tableName, schema);
  return schema;
}

function pickExistingColumn(schema, candidates) {
  const names = schema.map((column) => column.name);
  return candidates.find((candidate) => names.includes(candidate)) || null;
}

async function getUserColumnMap() {
  const schema = await getTableSchema("users");

  return {
    id: pickExistingColumn(schema, ["id", "user_id"]),
    name: pickExistingColumn(schema, ["name", "full_name", "username", "first_name"]),
    rfid: pickExistingColumn(schema, ["rfid", "rfid_uid", "uid", "card_uid", "rfid_tag"]),
  };
}

async function getSlotQueryParts() {
  const schema = await getTableSchema("slots");
  const hasLevel = schema.some((column) => column.name === "level");

  return {
    hasLevel,
    select: hasLevel
      ? "id, slot_number, status, level"
      : "id, slot_number, status",
    orderBy: hasLevel
      ? "ORDER BY COALESCE(level, 999), id"
      : "ORDER BY id",
  };
}

async function canStoreGuestBooking() {
  const schema = await getTableSchema("bookings");
  const userIdColumn = schema.find((column) => column.name === "user_id");

  if (!userIdColumn) {
    return false;
  }

  return userIdColumn.notnull === 0;
}

async function releaseExpiredBookings() {
  const now = new Date().toISOString();

  const expiredBookings = await all(
    `
      SELECT id, slot_id
      FROM bookings
      WHERE status = 'active'
        AND expires_at IS NOT NULL
        AND expires_at <= ?
    `,
    [now]
  );

  if (!expiredBookings.length) {
    return 0;
  }

  for (const booking of expiredBookings) {
    await execute(
      `
        UPDATE bookings
        SET status = 'expired'
        WHERE id = ?
      `,
      [booking.id]
    );

    await execute(
      `
        UPDATE slots
        SET status = 'available'
        WHERE id = ?
          AND LOWER(status) = 'booked'
      `,
      [booking.slot_id]
    );
  }

  console.log(`[parkingService] Released ${expiredBookings.length} expired booking(s)`);
  return expiredBookings.length;
}

async function findUserByRfid(rfid) {
  const userColumns = await getUserColumnMap();

  if (!userColumns.rfid) {
    console.warn("[parkingService] No RFID column found in users table. Scan will be treated as guest.");
    return null;
  }

  return one(
    `
      SELECT *
      FROM users
      WHERE ${userColumns.rfid} = ?
      LIMIT 1
    `,
    [rfid]
  );
}

async function getUserId(user) {
  if (!user) {
    return null;
  }

  const userColumns = await getUserColumnMap();
  const idColumn = userColumns.id || "id";
  return user[idColumn];
}

async function getUserName(user) {
  if (!user) {
    return "Guest";
  }

  const userColumns = await getUserColumnMap();
  const nameColumn = userColumns.name;

  if (!nameColumn || !user[nameColumn]) {
    return "User";
  }

  return String(user[nameColumn]).trim();
}

async function findCurrentBookingForUser(userId) {
  if (userId == null) {
    return null;
  }

  const now = new Date().toISOString();

  return one(
    `
      SELECT
        b.id AS booking_id,
        b.user_id,
        b.slot_id,
        b.status AS booking_status,
        b.expires_at,
        s.slot_number,
        s.status AS slot_status,
        s.level
      FROM bookings b
      INNER JOIN slots s ON s.id = b.slot_id
      WHERE b.user_id = ?
        AND (
          (b.status = 'active' AND (b.expires_at IS NULL OR b.expires_at > ?))
          OR b.status = 'occupied'
        )
      ORDER BY
        CASE WHEN b.status = 'occupied' THEN 0 ELSE 1 END,
        b.expires_at ASC
      LIMIT 1
    `,
    [userId, now]
  );
}

async function getAvailableSlots() {
  const { select, orderBy } = await getSlotQueryParts();

  return all(
    `
      SELECT ${select}
      FROM slots
      WHERE LOWER(status) = 'available'
      ${orderBy}
    `
  );
}

async function reserveAvailableSlot(slotId) {
  const result = await execute(
    `
      UPDATE slots
      SET status = 'booked'
      WHERE id = ?
        AND LOWER(status) = 'available'
    `,
    [slotId]
  );

  return result.rowsAffected > 0;
}

async function createAssignmentBooking({ userId, slotId }) {
  const allowGuest = await canStoreGuestBooking();

  if (userId == null && !allowGuest) {
    console.warn("[parkingService] Guest booking row skipped because bookings.user_id is NOT NULL");
    return false;
  }

  const columns = ["slot_id", "status", "expires_at"];
  const placeholders = ["?", "?", "?"];
  const args = [slotId, "active", addHoursToNow(1)];

  if (userId != null || allowGuest) {
    columns.unshift("user_id");
    placeholders.unshift("?");
    args.unshift(userId ?? null);
  }

  await execute(
    `
      INSERT INTO bookings (${columns.join(", ")})
      VALUES (${placeholders.join(", ")})
    `,
    args
  );

  return true;
}

async function createPreBooking({ userId, slotId }) {
  await releaseExpiredBookings();

  const user = await one(
    `
      SELECT id
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [userId]
  );

  if (!user) {
    throw new Error("User not found.");
  }

  const slot = await one(
    `
      SELECT id, slot_number, status
      FROM slots
      WHERE id = ?
      LIMIT 1
    `,
    [slotId]
  );

  if (!slot) {
    throw new Error("Slot not found.");
  }

  if (normalizeStatus(slot.status) !== "available") {
    throw new Error(`Slot ${slot.slot_number} is not available for booking.`);
  }

  const existingUserBooking = await one(
    `
      SELECT id
      FROM bookings
      WHERE user_id = ?
        AND (
          (status = 'active' AND (expires_at IS NULL OR expires_at > ?))
          OR status = 'occupied'
        )
      LIMIT 1
    `,
    [userId, new Date().toISOString()]
  );

  if (existingUserBooking) {
    throw new Error("User already has an active booking.");
  }

  const slotLocked = await reserveAvailableSlot(slotId);

  if (!slotLocked) {
    throw new Error("Slot was just taken by another request.");
  }

  const expiresAt = addHoursToNow(1);

  try {
    await execute(
      `
        INSERT INTO bookings (user_id, slot_id, status, expires_at)
        VALUES (?, ?, ?, ?)
      `,
      [userId, slotId, "active", expiresAt]
    );
  } catch (error) {
    await execute(
      `
        UPDATE slots
        SET status = 'available'
        WHERE id = ?
          AND LOWER(status) = 'booked'
      `,
      [slotId]
    );

    throw error;
  }

  console.log(`[parkingService] Pre-booking created. user_id=${userId}, slot_id=${slotId}, expires_at=${expiresAt}`);

  return {
    message: `Booking created for ${slot.slot_number}`,
    slot: slot.slot_number,
    status: "booked",
    expires_at: expiresAt,
  };
}

async function assignSlotFromRfid(rfid) {
  console.log(`[parkingService] RFID scan received: ${rfid}`);
  await releaseExpiredBookings();

  const user = await findUserByRfid(rfid);
  const userId = await getUserId(user);
  const userName = await getUserName(user);

  if (userId != null) {
    const existingBooking = await findCurrentBookingForUser(userId);

    if (existingBooking) {
      if (normalizeStatus(existingBooking.slot_status) === "available") {
        await execute(
          `
            UPDATE slots
            SET status = 'booked'
            WHERE id = ?
          `,
          [existingBooking.slot_id]
        );
      }

      console.log(
        `[parkingService] Assigned pre-booked/current slot ${existingBooking.slot_number} to user_id=${userId}`
      );

      return {
        message: `Welcome ${userName}`,
        slot: existingBooking.slot_number,
        status: "assigned",
      };
    }
  }

  const availableSlots = await getAvailableSlots();

  for (const slot of availableSlots) {
    const locked = await reserveAvailableSlot(slot.id);

    if (!locked) {
      continue;
    }

    try {
      await createAssignmentBooking({ userId, slotId: slot.id });
    } catch (error) {
      console.error("[parkingService] Failed to create assignment booking row:", error.message);
    }

    console.log(
      `[parkingService] Assigned available slot ${slot.slot_number} to ${userId != null ? `user_id=${userId}` : "guest"}`
    );

    return {
      message: userId != null ? `Welcome ${userName}` : "Welcome",
      slot: slot.slot_number,
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

  const slot = await one(
    `
      SELECT id, slot_number, status
      FROM slots
      WHERE id = ?
      LIMIT 1
    `,
    [slotId]
  );

  if (!slot) {
    throw new Error("Slot not found.");
  }

  if (occupied) {
    await execute(
      `
        UPDATE slots
        SET status = 'occupied'
        WHERE id = ?
      `,
      [slotId]
    );

    await execute(
      `
        UPDATE bookings
        SET status = 'occupied'
        WHERE slot_id = ?
          AND status = 'active'
      `,
      [slotId]
    );

    console.log(`[parkingService] IR update: slot ${slot.slot_number} -> occupied`);

    return {
      message: `Slot ${slot.slot_number} marked occupied`,
      slot: slot.slot_number,
      status: "occupied",
    };
  }

  await execute(
    `
      UPDATE slots
      SET status = 'available'
      WHERE id = ?
    `,
    [slotId]
  );

  await execute(
    `
      UPDATE bookings
      SET status = 'completed'
      WHERE slot_id = ?
        AND status IN ('active', 'occupied')
    `,
    [slotId]
  );

  console.log(`[parkingService] IR update: slot ${slot.slot_number} -> available`);

  return {
    message: `Slot ${slot.slot_number} marked available`,
    slot: slot.slot_number,
    status: "available",
  };
}

async function getAllSlots() {
  await releaseExpiredBookings();

  const { select, orderBy, hasLevel } = await getSlotQueryParts();

  const slots = await all(
    `
      SELECT ${select}
      FROM slots
      ${orderBy}
    `
  );

  return slots.map((slot) => ({
    ...slot,
    level: hasLevel ? slot.level : 1,
    status: normalizeStatus(slot.status),
  }));
}

module.exports = {
  assignSlotFromRfid,
  createPreBooking,
  getAllSlots,
  updateSlotFromIr,
};
