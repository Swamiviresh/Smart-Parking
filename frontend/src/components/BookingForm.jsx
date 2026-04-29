import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function BookingForm({ onBookingCreated }) {
  const [slots, setSlots] = useState([]);
  const [formData, setFormData] = useState({
    slot_id: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '',
    duration: '1'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/slots').then(res => setSlots(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/bookings/create', formData);
      setMessage({ type: 'success', text: res.data.message });
      if (onBookingCreated) onBookingCreated();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create booking' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-navy-light p-6 rounded-2xl border border-slate-700 shadow-xl">
      <h3 className="text-xl font-bold text-white mb-4">Pre-book a Slot</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-slate-400 text-sm mb-1">Select Slot</label>
          <select
            required
            className="w-full bg-navy-medium border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:border-blue"
            value={formData.slot_id}
            onChange={(e) => setFormData({ ...formData, slot_id: e.target.value })}
          >
            <option value="">Choose a slot...</option>
            {slots.map(slot => (
              <option key={slot.id} value={slot.id}>
                {slot.slot_number} (Level {slot.level})
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1">Date</label>
            <input
              type="date"
              required
              className="w-full bg-navy-medium border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:border-blue"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Start Time</label>
            <input
              type="time"
              required
              className="w-full bg-navy-medium border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:border-blue"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Duration (Hours)</label>
          <input
            type="number"
            min="1"
            max="24"
            required
            className="w-full bg-navy-medium border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:border-blue"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Confirm Booking'}
        </button>
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
