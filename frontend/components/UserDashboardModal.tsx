import React, { useState, useEffect } from 'react';
import { X, User, Ticket, LogOut, Clock, Download, ChevronRight } from 'lucide-react';
import { UserProfile, Booking } from '../types/cinema';

interface UserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const UserDashboardModal: React.FC<UserDashboardModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/user')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setBookings(data.bookings);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col sm:flex-row">
        
        {/* Sidebar Navigation */}
        <div className="w-full sm:w-64 bg-slate-50 dark:bg-slate-950 p-6 flex flex-col border-r border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 shadow-sm border-2 border-white dark:border-slate-800">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">{user.name}</h3>
              <p className="text-[10px] font-bold text-amber-500">{user.rewardPoints} Reward Points</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'bookings'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200 dark:border-slate-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>My Tickets</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200 dark:border-slate-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile Details</span>
            </button>
          </nav>

          <button onClick={onClose} className="mt-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Close Dashboard</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-white dark:bg-slate-900 relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 sm:hidden">
            <X className="w-5 h-5" />
          </button>

          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-rose-500" />
                <span>My Ticket History</span>
              </h2>

              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading bookings...</div>
              ) : bookings.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">No bookings found.</div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((b) => (
                    <div key={b.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <img src={b.moviePoster} alt={b.movieTitle} className="w-20 h-28 object-cover rounded-xl shadow-md hidden sm:block" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{b.movieTitle}</h3>
                            <p className="text-xs text-slate-500">{b.theatreName}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            CONFIRMED
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase">Date & Time</span>
                            <p className="font-semibold text-slate-700 dark:text-slate-300">{b.showDate} • {b.showTime}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase">Seats</span>
                            <p className="font-bold text-amber-600 dark:text-amber-400">{b.seats.map(s => s.row + s.number).join(', ')}</p>
                          </div>
                        </div>
                        <div className="pt-2 flex items-center gap-3">
                          <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                            <Download className="w-3.5 h-3.5" /> E-Ticket
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Profile Details</h2>
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Full Name</label>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 py-2">{user.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Email Address</label>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 py-2">{user.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 py-2">{user.phone}</p>
                </div>
                <div className="pt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-1">
                  <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300">Invite Friends & Earn Points</h4>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/80">Share your referral code to earn 100 CinePoints.</p>
                  <div className="text-sm font-black tracking-widest text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-3 py-1.5 rounded inline-block shadow-sm">
                    {user.referralCode}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
