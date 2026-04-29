import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [rfid, setRfid] = useState('');
  const [passwords, setPasswords] = useState({ current: '', new: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      setRfid(res.data.rfid || '');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRfid = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/auth/update-rfid', { rfid });
      setMessage({ type: 'success', text: 'RFID updated successfully' });
      fetchUser();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update RFID' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      setMessage({ type: 'success', text: 'Password changed successfully' });
      setPasswords({ current: '', new: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="min-h-screen bg-navy text-white p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-navy text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto p-6 space-y-8">
        <header>
          <h1 className="text-3xl font-bold">User Profile</h1>
          <p className="text-slate-400">Manage your account settings and RFID tag</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Account Info & RFID */}
          <section className="bg-navy-light p-6 rounded-2xl border border-slate-700 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Account Details</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Name</span>
                  <span>{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email</span>
                  <span>{user.email}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateRfid} className="space-y-4 pt-4 border-t border-slate-700">
              <h2 className="text-xl font-bold">RFID Tag Linking</h2>
              <div>
                <label className="block text-slate-400 text-sm mb-1">RFID Tag UID</label>
                <input
                  type="text"
                  placeholder="Enter RFID UID"
                  className="w-full bg-navy-medium border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:border-blue"
                  value={rfid}
                  onChange={(e) => setRfid(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                Save RFID
              </button>
            </form>
          </section>

          {/* Password Change */}
          <section className="bg-navy-light p-6 rounded-2xl border border-slate-700">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  className="w-full bg-navy-medium border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:border-blue"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">New Password</label>
                <input
                  type="password"
                  required
                  className="w-full bg-navy-medium border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:border-blue"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full border border-slate-600 hover:bg-slate-700 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                Update Password
              </button>
            </form>
          </section>
        </div>

        {message && (
          <div className={`p-4 rounded-lg text-center ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
            {message.text}
          </div>
        )}
      </main>
    </div>
  );
}
