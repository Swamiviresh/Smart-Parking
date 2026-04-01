const express = require('express');
const { client } = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken, requireAdmin);

router.get('/slots', async (req, res) => {
  try {
    const result = await client.execute(`
      SELECT ps.id, ps.slot_number, ps.status, ps.level,
             b.expires_at
      FROM parking_slots ps
      LEFT JOIN bookings b ON ps.id = b.slot_id AND b.status = 'active'
      ORDER BY ps.id
    `);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Admin get slots error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const result = await client.execute(`
      SELECT b.id, u.name AS user_name, u.email AS user_email,
             ps.slot_number, ps.level, b.booked_at, b.duration_hours, b.expires_at, b.status
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN parking_slots ps ON b.slot_id = ps.id
      ORDER BY b.booked_at DESC
    `);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Admin get bookings error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalResult = await client.execute(`SELECT COUNT(*) AS count FROM parking_slots`);
    const availResult = await client.execute(`SELECT COUNT(*) AS count FROM parking_slots WHERE status = 'available'`);
    const bookedResult = await client.execute(`SELECT COUNT(*) AS count FROM parking_slots WHERE status = 'booked'`);

    const l1Total = await client.execute(`SELECT COUNT(*) AS count FROM parking_slots WHERE level = 1`);
    const l1Avail = await client.execute(`SELECT COUNT(*) AS count FROM parking_slots WHERE level = 1 AND status = 'available'`);
    const l1Booked = await client.execute(`SELECT COUNT(*) AS count FROM parking_slots WHERE level = 1 AND status = 'booked'`);

    const l2Total = await client.execute(`SELECT COUNT(*) AS count FROM parking_slots WHERE level = 2`);
    const l2Avail = await client.execute(`SELECT COUNT(*) AS count FROM parking_slots WHERE level = 2 AND status = 'available'`);
    const l2Booked = await client.execute(`SELECT COUNT(*) AS count FROM parking_slots WHERE level = 2 AND status = 'booked'`);

    return res.status(200).json({
      total: Number(totalResult.rows[0].count),
      available: Number(availResult.rows[0].count),
      booked: Number(bookedResult.rows[0].count),
      level1: {
        total: Number(l1Total.rows[0].count),
        available: Number(l1Avail.rows[0].count),
        booked: Number(l1Booked.rows[0].count)
      },
      level2: {
        total: Number(l2Total.rows[0].count),
        available: Number(l2Avail.rows[0].count),
        booked: Number(l2Booked.rows[0].count)
      }
    });
  } catch (err) {
    console.error('Admin get stats error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
