const axios = require('axios');

async function testFlow() {
  const baseURL = 'http://localhost:3000/api';
  
  console.log('--- 1. Testing Slot Initialization ---');
  try {
    const slotsRes = await axios.get(`${baseURL}/slots`);
    console.log('Slots:', slotsRes.data.map(s => `${s.slot_number}: ${s.status}`));
    if (slotsRes.data.length !== 2) throw new Error('Expected 2 slots');
  } catch (err) {
    console.error('Slot test failed:', err.message);
  }

  console.log('\n--- 2. Testing IR Sensor Update ---');
  try {
    const updateRes = await axios.post(`${baseURL}/slots/update-status`, {
      slot_id: 1,
      status: 'occupied'
    });
    console.log('Update P1 to occupied:', updateRes.data);
    
    const slotsResAfter = await axios.get(`${baseURL}/slots`);
    console.log('P1 Status after update:', slotsResAfter.data.find(s => s.id === 1).status);
  } catch (err) {
    console.error('IR test failed:', err.message);
  }

  console.log('\n--- 3. Testing Guest RFID Scan (P2 should be assigned) ---');
  try {
    const scanRes = await axios.post(`${baseURL}/rfid/scan`, {
      rfid: 'GUEST_UID_123'
    });
    console.log('Guest Scan Result:', scanRes.data);
    // Should be slot 2 because slot 1 is occupied
  } catch (err) {
    console.error('Guest RFID test failed:', err.message);
  }

  console.log('\n--- 4. Testing FULL status ---');
  try {
    // Occupy slot 2
    await axios.post(`${baseURL}/slots/update-status`, {
      slot_id: 2,
      status: 'occupied'
    });
    
    const scanResFull = await axios.post(`${baseURL}/rfid/scan`, {
      rfid: 'ANOTHER_GUEST'
    });
    console.log('Full Scan Result:', scanResFull.data);
  } catch (err) {
    console.error('Full RFID test failed:', err.message);
  }
  
  // Cleanup
  await axios.post(`${baseURL}/slots/update-status`, { slot_id: 1, status: 'available' });
  await axios.post(`${baseURL}/slots/update-status`, { slot_id: 2, status: 'available' });
}

testFlow();
