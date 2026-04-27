const express = require('express');
const router = express.Router();
const { client } = require('../db/database');


// 🔹 ESP API (IMPORTANT)
router.post('/update', async (req, res) => {
  try {
    const { slot1, slot2 } = req.body;

    // Update Slot 1
    await client.execute({
      sql: `UPDATE parking_slots SET status=? WHERE id=1`,
      args: [slot1 == 1 ? 'booked' : 'available']
    });

    // Update Slot 2
    await client.execute({
      sql: `UPDATE parking_slots SET status=? WHERE id=2`,
      args: [slot2 == 1 ? 'booked' : 'available']
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update slots' });
  }
});


// 🔹 Get all slots (for frontend)
router.get('/', async (req, res) => {
  try {
    const result = await client.execute(`SELECT * FROM parking_slots`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

module.exports = router;