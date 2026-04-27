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

// Serve frontend
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/admin', adminRoutes);

// React fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

// 404 API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

// Init DB
initializeDatabase();

// Booking expiry job (SAFE)
setInterval(async () => {
  try {
    const now = new Date().toISOString();

    const expired = await client.execute({
      sql: `SELECT id FROM bookings WHERE status='active' AND expires_at <= ?`,
      args: [now]
    });

    for (const b of expired.rows) {
      await client.execute({
        sql: `UPDATE bookings SET status='expired' WHERE id=?`,
        args: [b.id]
      });
    }

  } catch (err) {
    console.error(err);
  }
}, 60000);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

await client.execute(`DELETE FROM parking_slots`);
await client.execute(`INSERT INTO parking_slots (id, status) VALUES (1, 'available'), (2, 'available')`);