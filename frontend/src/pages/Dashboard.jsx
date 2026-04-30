import { useEffect, useState } from "react";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import SlotCard from "../components/SlotCard";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [bookingsRes, slotsRes] = await Promise.all([
        api.get("/bookings/my"),
        api.get("/slots")
      ]);
      setBookings(bookingsRes.data);
      setSlots(slotsRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09101f] text-slate-900 dark:text-[#eef4ff] font-sans transition-colors duration-300">
      <Navbar />
      <main className="max-w-6xl mx-auto p-6">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time parking availability and bookings.</p>
          </div>
          <Link
            to="/profile"
            className="bg-white dark:bg-navy-light border border-slate-200 dark:border-slate-700 px-6 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm font-semibold"
          >
            My Profile
          </Link>
        </header>

        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue rounded-full"></span>
            Available Slots
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map(slot => (
              <SlotCard key={slot.id} slot={slot} onBookingCreated={fetchData} />
            ))}
          </div>
        </section>

        <section>
          <div className="bg-white dark:bg-navy-light p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl transition-colors">
            <h2 className="text-xl font-bold mb-8">My Recent Bookings</h2>
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin h-8 w-8 border-4 border-blue border-t-transparent rounded-full"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 dark:bg-navy-medium/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400">No bookings found. Start by pre-booking a slot above!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-5 bg-slate-50 dark:bg-navy-medium rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue/10 rounded-xl flex items-center justify-center text-blue font-bold">
                        {booking.slot_number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            booking.status === 'active' ? 'bg-green-500/10 text-green-600' :
                            booking.status === 'occupied' ? 'bg-yellow-500/10 text-yellow-600' :
                            'bg-slate-500/10 text-slate-500'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-sm font-semibold">
                          {new Date(booking.start_time).toLocaleDateString()} @ {new Date(booking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Booking ID</p>
                      <p className="font-mono text-sm font-bold text-slate-600 dark:text-slate-300">#{booking.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
