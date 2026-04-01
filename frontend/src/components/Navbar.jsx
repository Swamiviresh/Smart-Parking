import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from './Logo';

export default function Navbar({ isAdmin = false }) {
  const navigate = useNavigate();
  const userName = localStorage.getItem('name');
  const isDisabled = localStorage.getItem('is_disabled');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-navy-light border-b border-slate-600">
      <div className="flex items-center gap-3">
        <Logo size={32} />
        <span className="text-lg font-bold text-white">Smart Parking</span>
        {isAdmin && (
          <span className="bg-blue text-white text-[0.65rem] px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
            Admin
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-slate-300 text-sm">
          Welcome, {userName}
          {!isAdmin && (isDisabled === '1' || isDisabled === 'true') && (
            <span className="ml-2 text-xs bg-blue/20 text-blue px-2 py-0.5 rounded-full">
              ♿ Level 1 Access
            </span>
          )}
        </span>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="px-4 py-2 text-sm border border-slate-600 rounded-lg text-white hover:bg-navy-medium transition-colors"
        >
          Logout
        </motion.button>
      </div>
    </nav>
  );
}
