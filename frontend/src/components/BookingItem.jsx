import { motion } from 'framer-motion';

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

const itemVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

export default function BookingItem({ booking, onCancel }) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-navy-light border border-slate-600 rounded-card px-5 py-4 mb-3"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-blue">{booking.slot_number}</span>
          <span className="inline-block bg-blue text-white text-[0.6rem] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
            L{booking.level}
          </span>
        </div>
        <span className="text-xs text-slate-400">
          From: {new Date(booking.start_time).toLocaleString()}
        </span>
        <span className="text-xs text-slate-400">
          To: {new Date(booking.expires_at).toLocaleString()}
        </span>
        <span className="text-sm text-blue font-medium">
          {getTimeRemaining(booking.expires_at)}
        </span>
      </div>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onCancel(booking.id)}
        className="mt-3 sm:mt-0 px-5 py-2 bg-red hover:bg-red-dark text-white text-sm font-semibold rounded-lg transition-colors"
      >
        Cancel
      </motion.button>
    </motion.div>
  );
}
