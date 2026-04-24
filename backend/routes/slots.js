const express = require('express');
const { client } = require('../db/database');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const now = new Date().toISOString();
    const result = await client.execute({
      sql: `
        SELECT ps.id, ps.slot_number, ps.level,
               b.start_time, b.expires_at,
               CASE 
                 WHEN b.id IS NOT NULL AND b.start_time <= ? AND b.expires_at > ? THEN 'booked'
                 ELSE 'available'
               END as status
        FROM parking_slots ps
        LEFT JOIN bookings b ON ps.id = b.slot_id AND b.status = 'active' 
             AND b.start_time <= ? AND b.expires_at > ?
        ORDER BY ps.id
      `,
      args: [now, now, now, now]
    });
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Get slots error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const result = await client.execute({
      sql: `
        SELECT b.id, b.booked_at, b.start_time, b.status, b.duration_hours, b.expires_at,
               ps.slot_number, ps.level
        FROM bookings b
        JOIN parking_slots ps ON b.slot_id = ps.id
        WHERE b.user_id = ? AND b.status = 'active'
        ORDER BY b.booked_at DESC
      `,
      args: [req.user.id]
    });
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Get my bookings error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/book', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ error: 'Only regular users can book slots.' });
    }

    const { slot_id, duration_hours, start_time } = req.body;

    if (!slot_id) {
      return res.status(400).json({ error: 'Slot ID is required.' });
    }

    const duration = parseInt(duration_hours);
    if (!duration || duration < 1 || duration > 24) {
      return res.status(400).json({ error: 'Duration must be between 1 and 24 hours.' });
    }

    const startTimeDate = start_time ? new Date(start_time) : new Date();
    if (isNaN(startTimeDate.getTime())) {
      return res.status(400).json({ error: 'Invalid start time.' });
    }
    
    if (startTimeDate < new Date(Date.now() - 5000)) { // 5s grace period
      return res.status(400).json({ error: 'Start time cannot be in the past.' });
    }

    const expires_at_date = new Date(startTimeDate.getTime() + duration * 60 * 60 * 1000);
    const expires_at = expires_at_date.toISOString();
    const startTimeIso = startTimeDate.toISOString();

    // Check if user already has an overlapping booking
    const userOverlap = await client.execute({
      sql: `SELECT b.id, ps.slot_number, b.start_time, b.expires_at 
            FROM bookings b 
            JOIN parking_slots ps ON b.slot_id = ps.id
            WHERE b.user_id = ? AND b.status = 'active'
            AND ((b.start_time < ? AND b.expires_at > ?) OR (b.start_time >= ? AND b.start_time < ?))`,
      args: [req.user.id, expires_at, startTimeIso, startTimeIso, expires_at]
    });

    if (userOverlap.rows.length > 0) {
      const b = userOverlap.rows[0];
      return res.status(400).json({
        error: `You already have an overlapping booking for slot ${b.slot_number} from ${new Date(b.start_time).toLocaleString()} to ${new Date(b.expires_at).toLocaleString()}.`
      });
    }

    // Fetch the slot by slot_id
    const slotResult = await client.execute({
      sql: `SELECT * FROM parking_slots WHERE id = ?`,
      args: [slot_id]
    });

    const slot = slotResult.rows[0];
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found.' });
    }

    const isDisabled = req.user.is_disabled === 1 || req.user.is_disabled === true;
    if (isDisabled && Number(slot.level) !== 1) {
      return res.status(403).json({ error: 'Disabled users can only book Level 1 slots.' });
    }

    // Check if slot has an overlapping booking
    const slotOverlap = await client.execute({
      sql: `SELECT id FROM bookings 
            WHERE slot_id = ? AND status = 'active'
            AND ((start_time < ? AND expires_at > ?) OR (start_time >= ? AND start_time < ?))`,
      args: [slot.id, expires_at, startTimeIso, startTimeIso, expires_at]
    });

    if (slotOverlap.rows.length > 0) {
      return res.status(400).json({ error: 'This slot is already booked for the selected time period.' });
    }

    await client.execute({
      sql: `INSERT INTO bookings (user_id, slot_id, start_time, duration_hours, expires_at, status) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [req.user.id, slot.id, startTimeIso, duration, expires_at, 'active']
    });

    // Update slot status only if booking starts now
    const now = new Date();
    if (startTimeDate <= now && expires_at_date > now) {
      await client.execute({
        sql: `UPDATE parking_slots SET status = 'booked' WHERE id = ?`,
        args: [slot.id]
      });
    }

    return res.status(201).json({
      message: `Slot ${slot.slot_number} booked successfully.`,
      slot_number: slot.slot_number,
      level: slot.level,
      start_time: startTimeIso,
      expires_at: expires_at
    });
  } catch (err) {
    console.error('Book slot error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ error: 'Only regular users can cancel bookings.' });
    }

    const { booking_id } = req.body;
    if (!booking_id) {
      return res.status(400).json({ error: 'Booking ID is required.' });
    }

    const bookingResult = await client.execute({
      sql: `SELECT * FROM bookings WHERE id = ?`,
      args: [booking_id]
    });
    const booking = bookingResult.rows[0];

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    if (Number(booking.user_id) !== req.user.id) {
      return res.status(403).json({ error: 'You can only cancel your own bookings.' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'This booking is already cancelled.' });
    }

    await client.execute({
      sql: `UPDATE bookings SET status = 'cancelled' WHERE id = ?`,
      args: [booking_id]
    });
    await client.execute({
      sql: `UPDATE parking_slots SET status = 'available' WHERE id = ?`,
      args: [booking.slot_id]
    });

    return res.status(200).json({ message: 'Booking cancelled successfully.' });
  } catch (err) {
    console.error('Cancel booking error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/expire', authenticateToken, async (req, res) => {
  try {
    const now = new Date().toISOString();
    const expired = await client.execute({
      sql: `SELECT b.id, b.slot_id FROM bookings b WHERE b.status = 'active' AND b.expires_at <= ?`,
      args: [now]
    });

    for (const booking of expired.rows) {
      await client.execute({ sql: `UPDATE bookings SET status = 'expired' WHERE id = ?`, args: [booking.id] });
      await client.execute({ sql: `UPDATE parking_slots SET status = 'available' WHERE id = ?`, args: [booking.slot_id] });
    }

    return res.status(200).json({ message: `Expired ${expired.rows.length} bookings.`, count: expired.rows.length });
  } catch (err) {
    console.error('Expire slots error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
