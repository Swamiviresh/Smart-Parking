const express = require("express");
const cors = require("cors");
const path = require("path");

const { initDB } = require("./db/database");

// Routes
const rfidRoutes = require("./routes/rfid");
const slotRoutes = require("./routes/slots");
const bookingRoutes = require("./routes/bookings");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check (optional but useful)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API Routes
app.use("/api/rfid", rfidRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/bookings", bookingRoutes);

// Serve frontend (Vite build)
app.use(express.static(path.join(__dirname, "..", "frontend", "dist")));

// React fallback (must be AFTER everything)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "dist", "index.html"));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Initialize DB
initDB()
  .then(() => {
    console.log("✅ Database initialized");
  })
  .catch((err) => {
    console.error("❌ DB init failed:", err);
  });

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Smart Parking server running on port ${PORT}`);
});