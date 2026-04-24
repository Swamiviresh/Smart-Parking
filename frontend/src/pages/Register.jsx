import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import Logo from '../components/Logo';
import Notification from '../components/Notification';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });

  const showNotification = (message, type) => {
    setNotification({ message, type, visible: true });
    setTimeout(() => setNotification((n) => ({ ...n, visible: false })), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password, is_disabled: isDisabled });
      showNotification('Registration successful! Redirecting to login...', 'success');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex items-center justify-center min-h-screen px-5"
    >
      <div className="w-full max-w-[400px] bg-navy-light border border-slate-600 rounded-card-lg p-10 shadow-xl backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Logo size={48} />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Smart Parking</h1>
          <p className="text-slate-400 text-sm mt-1">Create a new account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm text-slate-300 font-medium mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 bg-navy border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-all"
            />
          </div>
          <div className="mb-5">
            <label className="block text-sm text-slate-300 font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-navy border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-all"
            />
          </div>
          <div className="mb-5">
            <label className="block text-sm text-slate-300 font-medium mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full px-4 py-3 bg-navy border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-all"
            />
          </div>

          <div className="mb-6 flex items-center gap-2">
            <input
              type="checkbox"
              id="isDisabled"
              checked={isDisabled}
              onChange={(e) => setIsDisabled(e.target.checked)}
              className="w-4 h-4 accent-blue cursor-pointer"
            />
            <label htmlFor="isDisabled" className="text-sm text-slate-300 cursor-pointer">
              I have a disability (reserved Level 1 access)
            </label>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue hover:bg-blue-hover text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Registering...
              </span>
            ) : 'Register'}
          </motion.button>
        </form>

        {error && (
          <motion.div
            animate={{ x: [0, -8, 8, -8, 0] }}
            transition={{ duration: 0.4 }}
            className="text-red text-center text-sm mt-4"
          >
            {error}
          </motion.div>
        )}

        <p className="text-center text-slate-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/" className="text-blue hover:underline">Login here</Link>
        </p>
      </div>

      <Notification
        message={notification.message}
        type={notification.type}
        visible={notification.visible}
      />
    </motion.div>
  );
}
