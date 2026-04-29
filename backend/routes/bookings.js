const express = require("express");
const { createPreBooking, getAllSlots } = require("../services/parkingService");
const { authenticateToken } = require("../middleware/authMiddleware");
const { client: db } = require("../db/database");

const router = express.Router();

router.post("/create", authenticateToken, async (req, res) => {
  try {
    const { slot_id, date, start_time, duration } = req.body;
    const userId = req.user.id;

    if (!slot_id || !date || !start_time || !duration) {
      return res.status(400).json({
        message: "slot_id, date, start_time, and duration are required.",
      });
    }

    // Combine date and start_time
    // Assuming start_time is in HH:mm format
    const startTimeIso = new Date(`${date}T${start_time}`).toISOString();

    console.log(`[bookings] POST /api/bookings/create -> user_id=${userId}, slot_id=${slot_id}, start=${startTimeIso}, duration=${duration}`);

    const booking = await createPreBooking({
      userId,
      slotId: Number(slot_id),
      startTime: startTimeIso,
      durationHours: Number(duration),
    });

    return res.status(201).json({
      message: "Booking created successfully.",
      booking,
    });
  } catch (error) {
    console.error("[bookings] Create error:", error);
    return res.status(400).json({
      message: error.message || "Failed to create booking.",
    });
  }
});

router.get("/my", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.execute({
      sql: `
        SELECT b.*, s.slot_number
        FROM bookings b
        JOIN slots s ON b.slot_id = s.id
        WHERE b.user_id = ?
        ORDER BY b.start_time DESC
      `,
      args: [userId]
    });

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("[bookings] Get my bookings error:", error);
    return res.status(500).json({
      message: "Failed to fetch your bookings.",
    });
  }
});

module.exports = router;
