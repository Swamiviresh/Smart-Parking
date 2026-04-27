const express = require("express");
const { createPreBooking } = require("../services/parkingService");

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const userId = Number(req.body?.user_id);
    const slotId = Number(req.body?.slot_id);

    if (!Number.isInteger(userId) || !Number.isInteger(slotId)) {
      return res.status(400).json({
        message: "user_id and slot_id are required integers.",
      });
    }

    console.log(`[bookings] POST /api/bookings/create -> user_id=${userId}, slot_id=${slotId}`);

    const booking = await createPreBooking({
      userId,
      slotId,
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

module.exports = router;
