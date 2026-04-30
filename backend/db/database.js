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
        rfid_tag TEXT UNIQUE
      )
    `);

    // Check if we need to rename old rfid column
    try {
      const columns = await client.execute("PRAGMA table_info(users)");
      const hasRfid = columns.rows.some(c => c.name === 'rfid');
      const hasRfidTag = columns.rows.some(c => c.name === 'rfid_tag');
      if (hasRfid && !hasRfidTag) {
        await client.execute("ALTER TABLE users RENAME COLUMN rfid TO rfid_tag");
      }
    } catch (err) {
      // Ignore errors here
    }

    // Slots table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS slots (
        id INTEGER PRIMARY KEY,
        slot_number TEXT,
        status TEXT,
        level INTEGER DEFAULT 1
      )
    `);

    // Ensure exactly 2 slots
    await client.execute("INSERT OR IGNORE INTO slots (id, slot_number, status, level) VALUES (1, 'P1', 'available', 1)");
    await client.execute("INSERT OR IGNORE INTO slots (id, slot_number, status, level) VALUES (2, 'P2', 'available', 2)");
    await client.execute("UPDATE slots SET slot_number = 'P1', level = 1 WHERE id = 1");
    await client.execute("UPDATE slots SET slot_number = 'P2', level = 2 WHERE id = 2");
    await client.execute("DELETE FROM slots WHERE id > 2");

    // Bookings table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        slot_id INTEGER,
        start_time TEXT,
        end_time TEXT,
        status TEXT DEFAULT 'active'
      )
    `);

    console.log("Database initialized");

  } catch (err) {
    console.error("DB Init Error:", err);
  }
}

module.exports = { client, initDB };
