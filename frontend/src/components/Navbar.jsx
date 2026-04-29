import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ isAdmin = false }) {
  const navigate = useNavigate();
  const userName = localStorage.getItem('name');
  const isDisabled = localStorage.getItem('is_disabled');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white dark:bg-navy-light border-b border-slate-200 dark:border-slate-600 shadow-sm transition-colors">
      <div className="flex items-center gap-3">
        <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-3">
          <Logo size={32} />
          <span className="text-lg font-bold text-navy dark:text-white">Smart Parking</span>
        </Link>
        {isAdmin && (
          <span className="bg-blue text-white text-[0.65rem] px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
            Admin
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <span className="text-slate-600 dark:text-slate-300 text-sm hidden md:inline">
          Welcome, {userName}
          {!isAdmin && (isDisabled === '1' || isDisabled === 'true') && (
            <span className="ml-2 text-xs bg-blue/10 text-blue px-2 py-0.5 rounded-full font-medium">
              ♿ Level 1 Access
            </span>
          )}
        </span>
        {!isAdmin && (
          <Link
            to="/profile"
            className="text-sm text-slate-600 dark:text-slate-300 hover:text-blue dark:hover:text-white transition-colors"
          >
            Profile
          </Link>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="px-4 py-2 text-sm bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
        >
          Logout
        </motion.button>
      </div>
    </nav>
  );
}
