const express = require("express");
const { assignSlotFromRfid } = require("../services/parkingService");

const router = express.Router();

router.post("/scan", async (req, res) => {
  try {
    const rfid = String(req.body?.rfid || "").trim();

    if (!rfid) {
      return res.status(400).json({
        message: "rfid is required.",
      });
    }

    console.log(`[rfid] POST /api/rfid/scan -> ${rfid}`);

    const result = await assignSlotFromRfid(rfid);

    return res.status(200).json(result);
  } catch (error) {
    console.error("[rfid] Scan error:", error);

    return res.status(500).json({
      message: error.message || "Failed to process RFID scan.",
      status: "error",
    });
  }
});

module.exports = router;
