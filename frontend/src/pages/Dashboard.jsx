import { useEffect, useState } from "react";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import BookingForm from "../components/BookingForm";
import ThemeToggle from "../components/ThemeToggle";
import { Link } from "react-router-dom";

const styles = `
  .dashboard-page {
    min-height: 100vh;
    background: #09101f;
    color: #eef4ff;
    font-family: Inter, sans-serif;
  }
  .dark .dashboard-page {
     background: #09101f;
  }
  .light .dashboard-page {
    background: #f0f2f5;
    color: #1a202c;
  }
  .light .bg-navy-light {
    background: #ffffff;
    border-color: #e2e8f0;
  }
  .light .text-white {
    color: #1a202c;
  }
  .light .text-slate-400 {
    color: #4a5568;
  }
`;

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
    <>
      <style>{styles}</style>
      <div className="dashboard-page">
        <Navbar />
        <main className="max-w-6xl mx-auto p-6">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Welcome Back</h1>
              <p className="text-slate-400">Manage your parking bookings here.</p>
            </div>
            <div className="flex gap-4 items-center">
              <ThemeToggle />
              <Link
                to="/profile"
                className="bg-navy-light border border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
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
              <div className="bg-navy-light p-6 rounded-2xl border border-slate-700 shadow-xl min-h-[400px]">
                <h2 className="text-xl font-bold mb-6">My Bookings</h2>
                {loading ? (
                  <p>Loading bookings...</p>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400">You have no bookings yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 bg-navy-medium rounded-xl border border-slate-700"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-blue text-xs font-bold px-2 py-1 rounded">
                              Slot {booking.slot_number}
                            </span>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              booking.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              booking.status === 'occupied' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>
                              {booking.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="mt-2 text-sm">
                            {new Date(booking.start_time).toLocaleString()} - {new Date(booking.end_time).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400 uppercase tracking-widest">ID</p>
                          <p className="font-mono">#{booking.id}</p>
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
    </>
  );
}
