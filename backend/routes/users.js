const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { client: db } = require("../db/database");

const router = express.Router();

router.put("/rfid", authenticateToken, async (req, res) => {
  try {
    const { rfid_tag } = req.body;
    const userId = req.user.id;

    if (!rfid_tag) {
      return res.status(400).json({
        message: "rfid_tag is required.",
      });
    }

    // Check if RFID is already linked to another user
    const existing = await db.execute({
      sql: `SELECT id FROM users WHERE rfid_tag = ? AND id != ?`,
      args: [rfid_tag.trim(), userId]
    });

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'This RFID tag is already linked to another account.' });
    }

    await db.execute({
      sql: `UPDATE users SET rfid_tag = ? WHERE id = ?`,
      args: [rfid_tag.trim(), userId]
    });

    return res.status(200).json({
      message: "RFID tag updated successfully.",
    });
  } catch (error) {
    console.error("[users] RFID update error:", error);
    return res.status(500).json({
      message: "Failed to update RFID tag.",
    });
  }
});

module.exports = router;
