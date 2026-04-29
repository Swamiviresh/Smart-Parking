const { createClient } = require("@libsql/client");

// Create DB client
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:parking.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Initialize tables (runs once)
async function initDB() {
  try {
    // Users table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user',
        is_disabled INTEGER DEFAULT 0,
        rfid TEXT UNIQUE
      )
    `);

    // Slots table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS slots (
        id INTEGER PRIMARY KEY,
        slot_number TEXT,
        status TEXT,
        level INTEGER DEFAULT 1
      )
    `);

    // Bookings table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        slot_id INTEGER,
        start_time TEXT,
        end_time TEXT,
        status TEXT DEFAULT 'active',
        expires_at TEXT
      )
    `);

    console.log("Database initialized");

  } catch (err) {
    console.error("DB Init Error:", err);
  }
}

module.exports = { client, initDB };
