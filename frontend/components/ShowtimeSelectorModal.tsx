import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { Movie, Theatre, Show, City } from '../types/cinema';

interface ShowtimeSelectorModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  currentCity: City;
  onSelectShowtime: (show: Show) => void;
}

export const ShowtimeSelectorModal: React.FC<ShowtimeSelectorModalProps> = ({
  movie,
  isOpen,
  onClose,
  currentCity,
  onSelectShowtime
}) => {
  // Generate next 7 dates dynamically
  const dates = React.useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const value = `${year}-${month}-${day}`;
      const display = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      let label = d.toLocaleDateString('en-GB', { weekday: 'short' });
      if (i === 0) label = 'Today';
      if (i === 1) label = 'Tomorrow';
      return { label, value, display };
    });
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(dates[0].value);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (movie && isOpen) {
      setLoading(true);
      Promise.all([
        fetch(`/api/theatres?cityId=${currentCity.id}`).then((r) => r.json()),
        fetch(`/api/shows?movieId=${movie.id}&date=${selectedDate}`).then((r) => r.json())
      ])
        .then(([tData, sData]) => {
          if (tData.success) setTheatres(tData.theatres);
          if (sData.success) setShows(sData.shows);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [movie, isOpen, currentCity, selectedDate]);

  if (!isOpen || !movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Step 1 of 3</span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Select Theatre & Showtime
            </h2>
            <p className="text-xs text-slate-500">{movie.title} • {currentCity.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Selector Tabs */}
        <div className="py-4 flex items-center gap-2 overflow-x-auto">
          {dates.map((d) => (
            <button
              key={d.value}
              onClick={() => setSelectedDate(d.value)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-center text-xs font-bold transition-all ${
                selectedDate === d.value
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <div>{d.label}</div>
              <div className="text-[10px] opacity-80">{d.display}</div>
            </button>
          ))}
        </div>

        {/* Theatres List */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading theatres and showtimes...</div>
        ) : theatres.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No shows found for this date.</div>
        ) : (
          <div className="space-y-6 pt-2">
            {theatres.map((theatre) => {
              const theatreShows = shows.filter((s) => s.theatreId === theatre.id);
              if (theatreShows.length === 0) return null;

              return (
                <div
                  key={theatre.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4 shadow-sm"
                >
                  {/* Theatre Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{theatre.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          ★ {theatre.rating}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>{theatre.location}</span>
                      </p>
                    </div>

                    {/* Facility Badges */}
                    <div className="flex flex-wrap gap-1">
                      {theatre.facilities.map((fac) => (
                        <span
                          key={fac}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Showtimes Pills */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {theatreShows.map((show) => {
                      const occupancyCount = show.bookedSeatIds.length;
                      let statusText = 'Available';
                      let statusColor = 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30';

                      if (occupancyCount > 6) {
                        statusText = 'Almost Full';
                        statusColor = 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30';
                      } else if (occupancyCount > 3) {
                        statusText = 'Fast Filling';
                        statusColor = 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30';
                      }

                      return (
                        <button
                          key={show.id}
                          onClick={() => {
                            onClose();
                            onSelectShowtime(show);
                          }}
                          className={`px-4 py-2.5 rounded-xl border text-left transition-all hover:scale-105 active:scale-95 shadow-sm ${statusColor}`}
                        >
                          <div className="text-xs font-black">{show.time}</div>
                          <div className="text-[10px] opacity-80 font-semibold">{show.format} • ₹{show.priceNormal}+</div>
                          <div className="text-[9px] font-extrabold uppercase mt-0.5 tracking-wider">{statusText}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
