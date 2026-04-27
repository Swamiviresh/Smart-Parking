const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function initDB() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      is_disabled INTEGER DEFAULT 0
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS parking_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slot_number TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'available',
      level INTEGER NOT NULL
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      slot_id INTEGER NOT NULL,
      booked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      start_time DATETIME NOT NULL,
      duration_hours INTEGER NOT NULL DEFAULT 1,
      expires_at DATETIME NOT NULL,
      status TEXT DEFAULT 'active'
    )
  `);

  // Migration: Add start_time to bookings if it doesn't exist
  try {
    await client.execute(`ALTER TABLE bookings ADD COLUMN start_time DATETIME`);
    // For existing bookings, set start_time to booked_at
    await client.execute(`UPDATE bookings SET start_time = booked_at WHERE start_time IS NULL`);
  } catch (err) {
    // Column might already exist
  }

  // Seed slots if empty
  const slots = await client.execute(`SELECT COUNT(*) as count FROM parking_slots`);
  if (slots.rows[0].count === 0) {
    for (let i = 1; i <= 2; i++) {
      const level = i;
      await client.execute({
        sql: `INSERT INTO parking_slots (slot_number, level) VALUES (?, ?)`,
        args: [`P${i}`, level]
      });
    }
  } else if (slots.rows[0].count > 2) {
    // Clean up to keep only 2 slots
    await client.execute(`DELETE FROM parking_slots WHERE id > 2`);
    await client.execute(`DELETE FROM bookings WHERE slot_id > 2`);
  }

  // Seed admin if not exists
  const bcrypt = require('bcrypt');
  const admin = await client.execute({
    sql: `SELECT * FROM users WHERE email = ?`,
    args: ['admin@parking.com']
  });
  if (admin.rows.length === 0) {
    const hashed = await bcrypt.hash('admin123', 10);
    await client.execute({
      sql: `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      args: ['Admin', 'admin@parking.com', hashed, 'admin']
    });
  }
}

module.exports = { client, initDB };
