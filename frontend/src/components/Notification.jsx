import { AnimatePresence, motion } from 'framer-motion';

export default function Notification({ message, type, visible }) {
  const bgColor = type === 'success'
    ? 'bg-green text-white'
    : 'bg-red text-white';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed bottom-8 right-8 px-6 py-4 rounded-card font-semibold text-sm shadow-lg z-50 ${bgColor}`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
