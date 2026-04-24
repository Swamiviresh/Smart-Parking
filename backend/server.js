const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB: initializeDatabase, client } = require('./db/database');

const authRoutes = require('./routes/auth');
const slotRoutes = require('./routes/slots');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files (Vite build output)
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all for React Router (must be AFTER all /api routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// Initialize database and start server
initializeDatabase();

// Background job for booking management — runs every 60 seconds
setInterval(async () => {
  try {
    const now = new Date().toISOString();

    // 1. Expire past bookings
    const expired = await client.execute({
      sql: `SELECT b.id, b.slot_id FROM bookings b WHERE b.status = 'active' AND b.expires_at <= ?`,
      args: [now]
    });
    for (const booking of expired.rows) {
      await client.execute({ sql: `UPDATE bookings SET status = 'expired' WHERE id = ?`, args: [booking.id] });
    }

    // 2. Update parking_slots status based on current active bookings
    // Reset all to available first, then set booked for currently active ones
    await client.execute(`UPDATE parking_slots SET status = 'available'`);
    await client.execute({
      sql: `UPDATE parking_slots SET status = 'booked'
            WHERE id IN (
              SELECT slot_id FROM bookings
              WHERE status = 'active' AND start_time <= ? AND expires_at > ?
            )`,
      args: [now, now]
    });

    if (expired.rows.length > 0) {
      console.log(`Auto-expired ${expired.rows.length} bookings`);
    }
  } catch (err) {
    console.error('Booking management job error:', err);
  }
}, 60000);

app.listen(PORT, () => {
  console.log(`Smart Parking server running on http://localhost:${PORT}`);
});
