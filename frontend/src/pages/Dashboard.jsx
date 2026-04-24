import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import SlotCard from '../components/SlotCard';
import BookingItem from '../components/BookingItem';
import Notification from '../components/Notification';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const containerVariants = {
  animate: { transition: { staggerChildren: 0.05 } },
};

export default function Dashboard() {
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });

  const showNotif = (message, type) => {
    setNotification({ message, type, visible: true });
    setTimeout(() => setNotification((n) => ({ ...n, visible: false })), 3000);
  };

  const loadSlots = useCallback(async () => {
    try {
      const { data } = await api.get('/slots');
      setSlots(data);
    } catch {
      showNotif('Failed to load parking slots.', 'error');
    }
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      const { data } = await api.get('/slots/my-bookings');
      setBookings(data);
    } catch {
      showNotif('Failed to load bookings.', 'error');
    }
  }, []);

  useEffect(() => {
    loadSlots();
    loadBookings();
    const slotInterval = setInterval(loadSlots, 60000);
    const bookingInterval = setInterval(loadBookings, 60000);
    // Live countdown updates every 30s
    const countdownInterval = setInterval(() => {
      setSlots((prev) => [...prev]);
      setBookings((prev) => [...prev]);
    }, 30000);
    return () => {
      clearInterval(slotInterval);
      clearInterval(bookingInterval);
      clearInterval(countdownInterval);
    };
  }, [loadSlots, loadBookings]);

  const handleBook = async (slotId, durationHours, startTime) => {
    try {
      const { data } = await api.post('/slots/book', { 
        slot_id: slotId, 
        duration_hours: durationHours,
        start_time: startTime 
      });
      showNotif(
        `Booked ${data.slot_number} (Level ${data.level}) starting ${new Date(data.start_time).toLocaleString()} until ${new Date(data.expires_at).toLocaleTimeString()}`,
        'success'
      );
      loadSlots();
      loadBookings();
    } catch (err) {
      showNotif(err.response?.data?.error || 'Failed to book slot.', 'error');
      loadSlots();
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      const { data } = await api.post('/slots/cancel', { booking_id: bookingId });
      showNotif(data.message, 'success');
      loadSlots();
      loadBookings();
    } catch (err) {
      showNotif(err.response?.data?.error || 'Failed to cancel booking.', 'error');
    }
  };

  const handleChangePassword = async () => {
    setPasswordMsg({ text: '', type: '' });
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ text: 'All fields are required.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    if (newPassword.length < 4) {
      setPasswordMsg({ text: 'New password must be at least 4 characters.', type: 'error' });
      return;
    }
    try {
      const { data } = await api.post('/auth/change-password', { currentPassword, newPassword });
      setPasswordMsg({ text: data.message, type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({ text: err.response?.data?.error || 'Failed to change password.', type: 'error' });
    }
  };

  const level1 = slots.filter((s) => Number(s.level) === 1);
  const level2 = slots.filter((s) => Number(s.level) === 2);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-5 py-8">
        {/* Level 1 Slots */}
        <h2 className="text-xl font-bold text-white mb-5 pb-2 border-b-2 border-blue inline-block">
          Level 1 — Ground Floor
        </h2>
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10"
        >
          {level1.map((slot) => (
            <SlotCard key={slot.id} slot={slot} onBook={handleBook} />
          ))}
        </motion.div>

        {/* Level 2 Slots */}
        <h2 className="text-xl font-bold text-white mb-5 pb-2 border-b-2 border-blue inline-block">
          Level 2 — Upper Floor
        </h2>
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10"
        >
          {level2.map((slot) => (
            <SlotCard key={slot.id} slot={slot} onBook={handleBook} />
          ))}
        </motion.div>

        {/* My Active Bookings */}
        <h2 className="text-xl font-bold text-white mb-5 pb-2 border-b-2 border-blue inline-block">
          My Active Bookings
        </h2>
        <motion.div variants={containerVariants} initial="initial" animate="animate" className="mb-10">
          {bookings.length === 0 ? (
            <p className="text-slate-400 italic py-5">You have no active bookings.</p>
          ) : (
            bookings.map((booking) => (
              <BookingItem key={booking.id} booking={booking} onCancel={handleCancel} />
            ))
          )}
        </motion.div>

        {/* Change Password */}
        <div className="max-w-md">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="text-lg font-bold text-white mb-4 pb-2 border-b-2 border-blue cursor-pointer bg-transparent"
          >
            Change Password {showChangePassword ? '▲' : '▼'}
          </motion.button>

          <motion.div
            initial={false}
            animate={showChangePassword ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-navy-light border border-slate-600 rounded-card p-6 shadow-lg">
              <div className="mb-4">
                <label className="block text-sm text-slate-300 font-medium mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 bg-navy border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue transition-all"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-slate-300 font-medium mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 bg-navy border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue transition-all"
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm text-slate-300 font-medium mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 bg-navy border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleChangePassword}
                className="w-full py-3 bg-navy-medium hover:bg-slate-600 text-white font-semibold rounded-lg border border-slate-600 transition-colors"
              >
                Change Password
              </motion.button>
              {passwordMsg.text && (
                <p className={`text-center text-sm mt-3 ${passwordMsg.type === 'success' ? 'text-green' : 'text-red'}`}>
                  {passwordMsg.text}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <Notification message={notification.message} type={notification.type} visible={notification.visible} />
    </motion.div>
  );
}
