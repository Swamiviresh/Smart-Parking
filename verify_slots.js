process.env.TURSO_DATABASE_URL = 'file:parking.db';
const { initDB, client } = require('./backend/db/database');

async function verify() {
  try {
    await initDB();
    const result = await client.execute('SELECT COUNT(*) as count FROM slots');
    console.log('Total slots:', result.rows[0].count);
    const slots = await client.execute('SELECT id, slot_number, level FROM slots');
    console.log('Slots detail:', JSON.stringify(slots.rows, null, 2));
    
    if (result.rows[0].count === 2) {
      console.log('Verification SUCCESS: Exactly 2 slots found.');
    } else {
      console.error('Verification FAILURE: Expected 2 slots, found ' + result.rows[0].count);
      process.exit(1);
    }
  } catch (err) {
    console.error('Verification error:', err);
    process.exit(1);
  } finally {
      process.exit(0);
  }
}

verify();
