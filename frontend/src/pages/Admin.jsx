import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import SlotCard from '../components/SlotCard';
import StatCard from '../components/StatCard';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const containerVariants = {
  animate: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);

  const loadStats = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  const loadSlots = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/slots');
      setSlots(data);
    } catch (err) {
      console.error('Failed to load admin slots:', err);
    }
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/bookings');
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadSlots();
    loadBookings();
    const interval = setInterval(() => {
      loadStats();
      loadSlots();
      loadBookings();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadStats, loadSlots, loadBookings]);

  const level1 = slots.filter((s) => Number(s.level) === 1);
  const level2 = slots.filter((s) => Number(s.level) === 2);

  const getStatusClass = (status) => {
    if (status === 'active') return 'bg-green/15 text-green';
    if (status === 'expired') return 'bg-yellow-500/15 text-yellow-400';
    return 'bg-red/15 text-red';
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <Navbar isAdmin />
      <div className="max-w-[1200px] mx-auto px-5 py-8">
        {/* Stats Row */}
        {stats && (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10"
          >
            <StatCard
              label="Total Slots"
              value={stats.total}
              colorClass="text-blue"
              sub1={{ label: 'L1', value: stats.level1.total }}
              sub2={{ label: 'L2', value: stats.level2.total }}
            />
            <StatCard
              label="Available"
              value={stats.available}
              colorClass="text-green"
              sub1={{ label: 'L1', value: stats.level1.available }}
              sub2={{ label: 'L2', value: stats.level2.available }}
            />
            <StatCard
              label="Booked"
              value={stats.booked}
              colorClass="text-red"
              sub1={{ label: 'L1', value: stats.level1.booked }}
              sub2={{ label: 'L2', value: stats.level2.booked }}
            />
          </motion.div>
        )}

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
            <SlotCard key={slot.id} slot={slot} readOnly />
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
            <SlotCard key={slot.id} slot={slot} readOnly />
          ))}
        </motion.div>

        {/* Bookings Table */}
        <h2 className="text-xl font-bold text-white mb-5 pb-2 border-b-2 border-blue inline-block">
          All Bookings
        </h2>
        <div className="overflow-x-auto mb-10 rounded-card border border-slate-600">
          <table className="w-full border-collapse">
            <thead className="bg-navy-medium sticky top-0">
              <tr>
                {['ID', 'User', 'Email', 'Slot', 'Level', 'Booked At', 'Duration', 'Expires At', 'Status'].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-300 font-semibold"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-slate-400 italic py-8">
                    No bookings yet.
                  </td>
                </tr>
              ) : (
                bookings.map((b, i) => (
                  <motion.tr
                    key={b.id}
                    variants={itemVariants}
                    className={`${i % 2 === 0 ? 'bg-navy-light' : 'bg-navy'} hover:bg-navy-medium transition-colors`}
                  >
                    <td className="px-4 py-3 text-sm border-b border-slate-700">{b.id}</td>
                    <td className="px-4 py-3 text-sm border-b border-slate-700">{b.user_name}</td>
                    <td className="px-4 py-3 text-sm border-b border-slate-700">{b.user_email}</td>
                    <td className="px-4 py-3 text-sm border-b border-slate-700">{b.slot_number}</td>
                    <td className="px-4 py-3 text-sm border-b border-slate-700">L{b.level}</td>
                    <td className="px-4 py-3 text-sm border-b border-slate-700">
                      {new Date(b.booked_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-slate-700">{b.duration_hours}h</td>
                    <td className="px-4 py-3 text-sm border-b border-slate-700">
                      {new Date(b.expires_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-slate-700">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClass(b.status)}`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
