const express = require("express");
const { getAllSlots, updateSlotFromIr } = require("../services/parkingService");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    console.log("[slots] GET /api/slots");

    const slots = await getAllSlots();
    console.log("[slots] Response:", slots);

    return res.status(200).json(slots);
  } catch (error) {
    console.error("[slots] Fetch error:", error);

    return res.status(500).json({
      message: error.message || "Failed to fetch slots.",
    });
  }
});

router.post("/update-from-ir", async (req, res) => {
  try {
    const slotId = Number(req.body?.slot_id);
    const occupied = req.body?.occupied;

    if (!Number.isInteger(slotId) || typeof occupied !== "boolean") {
      return res.status(400).json({
        message: "slot_id must be an integer and occupied must be a boolean.",
      });
    }

    console.log(`[slots] POST /api/slots/update-from-ir -> slot_id=${slotId}, occupied=${occupied}`);

    const result = await updateSlotFromIr({
      slotId,
      occupied,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("[slots] IR update error:", error);

    return res.status(500).json({
      message: error.message || "Failed to update slot from IR sensor.",
    });
  }
});

module.exports = router;
