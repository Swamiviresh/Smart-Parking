const { createClient } = require("@libsql/client");

// Create DB client
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
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
        status TEXT,
        expires_at TEXT
      )
    `);

    console.log("Database initialized");

  } catch (err) {
    console.error("DB Init Error:", err);
  }
}

module.exports = { client, initDB };