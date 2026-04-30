import { useState } from 'react';
import api from '../utils/api';

export default function SlotCard({ slot, onBookingCreated }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    start_time: '',
    duration: '1'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const isOccupied = slot.status === 'occupied';
  const isBooked = slot.status === 'booked';
  
  // Disable if occupied or booked soon (simplified logic for UI)
  const isDisabled = isOccupied || (isBooked && slot.prebooked_until && new Date(slot.prebooked_until) > new Date());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/bookings/create', {
        ...formData,
        slot_id: slot.id
      });
      setMessage({ type: 'success', text: 'Prebooked!' });
      if (onBookingCreated) onBookingCreated();
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (slot.status) {
      case 'available': return 'bg-green-500';
      case 'booked': return 'bg-blue-500';
      case 'occupied': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className={`p-6 rounded-2xl border transition-all duration-300 shadow-lg ${
      isOccupied ? 'bg-red-500/5 border-red-500/20' : 
      isBooked ? 'bg-blue-500/5 border-blue-500/20' : 
      'bg-white dark:bg-navy-light border-slate-200 dark:border-slate-700'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold dark:text-white">Slot {slot.slot_number}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Level {slot.level}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider ${getStatusColor()}`}>
          {slot.status}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold mb-1">Date</label>
            <input
              type="date"
              required
              className="w-full bg-slate-50 dark:bg-navy-medium border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm dark:text-white outline-none focus:border-blue transition-colors"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold mb-1">Start Time</label>
            <input
              type="time"
              required
              className="w-full bg-slate-50 dark:bg-navy-medium border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm dark:text-white outline-none focus:border-blue transition-colors"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold mb-1">Duration (Hours)</label>
          <input
            type="number"
            min="1"
            max="24"
            required
            className="w-full bg-slate-50 dark:bg-navy-medium border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm dark:text-white outline-none focus:border-blue transition-colors"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading || isDisabled}
          className={`w-full font-bold py-3 rounded-xl transition-all duration-300 transform active:scale-95 shadow-md ${
            isDisabled 
            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
            : 'bg-blue hover:bg-blue-600 text-white hover:shadow-blue-500/25'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : (
            'Prebook Now'
          )}
        </button>

        {message && (
          <div className={`mt-2 p-3 rounded-lg text-center text-xs font-medium animate-fade-in ${
            message.type === 'success' 
            ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' 
            : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
          }`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
