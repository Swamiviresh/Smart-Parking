import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const itemVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

function getTimeRemaining(expiresAt) {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires - now;
  if (diff <= 0) return 'Expired';
  if (diff < 5 * 60 * 1000) return 'Expiring soon';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

export default function SlotCard({ slot, onBook, readOnly = false }) {
  const [showPicker, setShowPicker] = useState(false);
  const [duration, setDuration] = useState('1');
  const [startTime, setStartTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [loading, setLoading] = useState(false);

  const isAvailable = slot.status === 'available';
  const borderColor = isAvailable ? 'border-green shadow-[0_0_15px_rgba(34,197,94,0.15)]' : 'border-red shadow-[0_0_15px_rgba(239,68,68,0.15)]';

  const handleConfirm = async () => {
    setLoading(true);
    await onBook(slot.id, parseInt(duration), startTime);
    setLoading(false);
    setShowPicker(false);
  };

  return (
    <motion.div
      variants={itemVariants}
      className={`bg-navy-light border-2 ${borderColor} rounded-card p-5 text-center hover:translate-y-[-2px] transition-transform`}
    >
      <div className="text-xl font-bold text-white mb-1">{slot.slot_number}</div>
      <span className="inline-block bg-blue text-white text-[0.65rem] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
        L{slot.level}
      </span>
      <div className={`text-xs uppercase tracking-widest mt-2 mb-3 font-semibold ${isAvailable ? 'text-green' : 'text-red'}`}>
        {isAvailable ? 'Available' : 'Occupied'}
      </div>

      {!isAvailable && slot.expires_at && (
        <div className="text-xs text-slate-400 italic">{getTimeRemaining(slot.expires_at)}</div>
      )}

      {isAvailable && !readOnly && !showPicker && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowPicker(true)}
          className="mt-2 px-5 py-2 bg-green hover:bg-green-dark text-white text-sm font-semibold rounded-lg transition-colors w-full"
        >
          Book
        </motion.button>
      )}

      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-slate-700 text-left">
              <label className="text-[0.7rem] text-slate-400 block mb-1">Start Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 bg-navy border border-slate-600 rounded-lg text-white text-xs mb-3 focus:border-blue focus:outline-none"
              />

              <label className="text-[0.7rem] text-slate-400 block mb-1">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-2 bg-navy border border-slate-600 rounded-lg text-white text-xs mb-4 focus:border-blue focus:outline-none"
              >
                <option value="1">1 Hour</option>
                <option value="2">2 Hours</option>
                <option value="3">3 Hours</option>
                <option value="4">4 Hours</option>
                <option value="6">6 Hours</option>
                <option value="8">8 Hours</option>
                <option value="12">12 Hours</option>
                <option value="24">24 Hours</option>
              </select>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 py-2 bg-blue hover:bg-blue-hover text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Booking...' : 'Confirm'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowPicker(false)}
                  className="flex-1 py-2 bg-red hover:bg-red-dark text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
