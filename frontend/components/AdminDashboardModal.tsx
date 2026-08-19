import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Users, Film, Ticket, LayoutDashboard, PlusCircle, Loader2 } from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'add_movie'>('overview');

  const [newMovie, setNewMovie] = useState({
    title: '',
    genres: 'Action, Sci-Fi',
    releaseDate: '2026-09-01',
    runtimeMinutes: '150'
  });
  const [addingMovie, setAddingMovie] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/admin/stats')
        .then(res => res.json())
        .then(data => {
          if (data.success) setStats(data.stats);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingMovie(true);
    try {
      const res = await fetch('/api/admin/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMovie,
          genres: newMovie.genres.split(',').map(g => g.trim())
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Movie Added Successfully to the system!');
        setNewMovie({ title: '', genres: 'Action', releaseDate: '', runtimeMinutes: '' });
        setActiveTab('overview');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingMovie(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl h-[85vh] rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="h-16 flex-shrink-0 flex items-center justify-between px-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Admin Command Center</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 sm:w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-4 space-y-2 flex-shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Overview Stats
            </button>
            <button
              onClick={() => setActiveTab('add_movie')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'add_movie'
                  ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <PlusCircle className="w-4 h-4" /> Add New Movie
            </button>
          </div>

          {/* Main Area */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
            {loading || !stats ? (
              <div className="flex h-full items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : activeTab === 'overview' ? (
              <div className="space-y-8 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 text-emerald-500 mb-2">
                      <TrendingUp className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase">Total Revenue</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">₹{stats.totalRevenue.toLocaleString()}</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 text-indigo-500 mb-2">
                      <Ticket className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase">Tickets Sold</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalTicketsSold.toLocaleString()}</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 text-rose-500 mb-2">
                      <Film className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase">Active Movies</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalMoviesActive}</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 text-amber-500 mb-2">
                      <Users className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase">Registered Users</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">12,408</div>
                  </div>
                </div>

                {/* Top Movies List */}
                <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Performing Movies</h3>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {stats.topMovies.map((tm: any, i: number) => (
                      <div key={i} className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-black text-slate-400 w-4">{i + 1}</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{tm.title}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">₹{tm.revenue.toLocaleString()}</div>
                          <div className="text-[10px] text-slate-500">{tm.ticketsSold} tickets</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Publish New Movie</h3>
                <form onSubmit={handleAddMovie} className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Movie Title</label>
                    <input required type="text" value={newMovie.title} onChange={e => setNewMovie({...newMovie, title: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Genres (comma separated)</label>
                    <input required type="text" value={newMovie.genres} onChange={e => setNewMovie({...newMovie, genres: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Release Date</label>
                      <input required type="date" value={newMovie.releaseDate} onChange={e => setNewMovie({...newMovie, releaseDate: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Runtime (mins)</label>
                      <input required type="number" value={newMovie.runtimeMinutes} onChange={e => setNewMovie({...newMovie, runtimeMinutes: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white" />
                    </div>
                  </div>
                  <button type="submit" disabled={addingMovie} className="mt-4 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors w-full">
                    {addingMovie ? 'Publishing to DB...' : 'Publish Movie'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
