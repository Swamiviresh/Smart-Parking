import { useEffect, useState } from "react";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import BookingForm from "../components/BookingForm";
import ThemeToggle from "../components/ThemeToggle";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/my");
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09101f] text-slate-900 dark:text-[#eef4ff] font-sans transition-colors duration-300">
      <Navbar />
      <main className="max-w-6xl mx-auto p-6">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your parking bookings here.</p>
          </div>
          <div className="flex gap-4 items-center">
            <Link
              to="/profile"
              className="bg-white dark:bg-navy-light border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              My Profile
            </Link>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <BookingForm onBookingCreated={fetchBookings} />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-navy-light p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl min-h-[400px] transition-colors">
              <h2 className="text-xl font-bold mb-6">My Bookings</h2>
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin h-8 w-8 border-4 border-blue border-t-transparent rounded-full"></div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 dark:text-slate-400">You have no bookings yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-medium rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-blue text-white text-xs font-bold px-2 py-1 rounded">
                            Slot {booking.slot_number}
                          </span>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            booking.status === 'active' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                            booking.status === 'occupied' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                            'bg-slate-500/20 text-slate-500 dark:text-slate-400'
                          }`}>
                            {booking.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium">
                          {new Date(booking.start_time).toLocaleString()} - {new Date(booking.end_time).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">ID</p>
                        <p className="font-mono font-bold">#{booking.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
