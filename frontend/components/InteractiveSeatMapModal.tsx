import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Check, Sparkles, ArrowRight, ShieldAlert, Monitor } from 'lucide-react';
import { Show, Movie, Theatre, Seat, SeatCategory } from '../types/cinema';
import { generateMockSeats, MOCK_THEATRES } from '../mockData';

interface InteractiveSeatMapModalProps {
  show: Show | null;
  isOpen: boolean;
  onClose: () => void;
  onProceedToFood: (selectedSeats: Seat[], show: Show) => void;
}

export const InteractiveSeatMapModal: React.FC<InteractiveSeatMapModalProps> = ({
  show,
  isOpen,
  onClose,
  onProceedToFood
}) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [theatre, setTheatre] = useState<Theatre | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && isOpen) {
      setLoading(true);
      setSeats([]);
      setSelectedSeatIds([]);
      fetch(`/api/shows/${show.id}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data?.success) {
            setSeats(Array.isArray(data.seats) ? data.seats : generateMockSeats());
            setMovie(data.movie);
            setTheatre(data.theatre);
          } else {
            setSeats(generateMockSeats());
            setTheatre(MOCK_THEATRES[0]);
          }
        })
        .catch(() => {
          setSeats(generateMockSeats());
          setTheatre(MOCK_THEATRES[0]);
        })
        .finally(() => setLoading(false));
    }
  }, [show, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSeats([]);
      setSelectedSeatIds([]);
      setMovie(null);
      setTheatre(null);
    }
  }, [isOpen]);

  if (!isOpen || !show) return null;

  const toggleSeatSelection = (seat: Seat) => {
    if (seat.isBooked) return;

    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds(selectedSeatIds.filter((id) => id !== seat.id));
    } else {
      if (selectedSeatIds.length >= 10) {
        alert('You can select a maximum of 10 seats per transaction.');
        return;
      }
      setSelectedSeatIds([...selectedSeatIds, seat.id]);
    }
  };

  const selectedSeats = seats.filter((s) => selectedSeatIds.includes(s.id));
  const totalPrice = selectedSeats.reduce((acc, s) => acc + s.price, 0);

  // Seat Category Color Helpers
  const getCategoryColor = (cat: SeatCategory, isBooked: boolean, isSelected: boolean) => {
    if (isBooked) return 'bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed border-transparent';
    if (isSelected) return 'bg-gradient-to-tr from-rose-600 to-indigo-600 text-white font-extrabold shadow-lg shadow-rose-500/40 ring-2 ring-rose-400 border-transparent transform scale-110 z-10';

    switch (cat) {
      case 'VIP':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/50 hover:bg-amber-200';
      case 'Premium':
        return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700/50 hover:bg-purple-200';
      case 'Executive':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700/50 hover:bg-blue-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/50 hover:bg-emerald-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-8 flex flex-col justify-between overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Step 2 of 3</span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {movie?.title || 'Interactive Seat Map'}
            </h2>
            <p className="text-xs text-slate-500">
              {theatre?.name} • {show.date} at {show.time} ({show.format})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.3))}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.75))}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="py-3 flex flex-wrap items-center justify-center gap-4 text-xs font-medium border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-300 dark:bg-slate-800 border" />
            <span className="text-slate-500">Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-gradient-to-r from-rose-600 to-indigo-600" />
            <span className="text-slate-900 dark:text-white font-bold">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-200 dark:bg-amber-900 border border-amber-400" />
            <span>VIP (₹{show.priceVIP})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-purple-200 dark:bg-purple-900 border border-purple-400" />
            <span>Premium (₹{show.pricePremium})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-blue-200 dark:bg-blue-900 border border-blue-400" />
            <span>Executive (₹{show.priceExecutive})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-200 dark:bg-emerald-900 border border-emerald-400" />
            <span>Normal (₹{show.priceNormal})</span>
          </div>
        </div>

        {/* Seat Stage / Screen Grid */}
        <div className="py-6 overflow-auto flex-1 flex flex-col items-center justify-center">
          <div
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
            className="transition-transform duration-200 flex flex-col items-center space-y-6 max-w-full px-4"
          >
            {/* Curved Screen Banner */}
            <div className="w-full max-w-xl text-center space-y-1">
              <div className="w-full h-3 rounded-full bg-gradient-to-r from-purple-500 via-rose-500 to-indigo-500 shadow-[0_10px_25px_rgba(244,63,94,0.5)] transform -perspective-x-12" />
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center justify-center gap-1">
                <Monitor className="w-3 h-3 text-rose-500" />
                <span>All Eyes This Way — Screen 4K Laser</span>
              </p>
            </div>

            {/* Grid Rows */}
            {loading ? (
              <div className="py-12 text-xs text-slate-400">Loading seat layout...</div>
            ) : (
              <div className="space-y-2">
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((rowLabel) => {
                  const rowSeats = seats.filter((s) => s.row === rowLabel);
                  if (rowSeats.length === 0) return null;

                  return (
                    <div key={rowLabel} className="flex items-center gap-2">
                      <span className="w-5 text-xs font-black text-slate-400 text-center">{rowLabel}</span>
                      <div className="flex items-center gap-1.5">
                        {rowSeats.slice(0, 6).map((seat) => {
                          const isSel = selectedSeatIds.includes(seat.id);
                          return (
                            <button
                              key={seat.id}
                              disabled={seat.isBooked}
                              onClick={() => toggleSeatSelection(seat)}
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center ${getCategoryColor(
                                seat.category,
                                seat.isBooked,
                                isSel
                              )}`}
                            >
                              {seat.number}
                            </button>
                          );
                        })}

                        {/* Aisle gap */}
                        <div className="w-4" />

                        {rowSeats.slice(6, 12).map((seat) => {
                          const isSel = selectedSeatIds.includes(seat.id);
                          return (
                            <button
                              key={seat.id}
                              disabled={seat.isBooked}
                              onClick={() => toggleSeatSelection(seat)}
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center ${getCategoryColor(
                                seat.category,
                                seat.isBooked,
                                isSel
                              )}`}
                            >
                              {seat.number}
                            </button>
                          );
                        })}
                      </div>
                      <span className="w-5 text-xs font-black text-slate-400 text-center">{rowLabel}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Checkout Bar */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 font-semibold">Selected Seats ({selectedSeats.length}):</span>
            <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{selectedSeats.map((s) => s.id).join(', ') || 'None selected'}</span>
              {selectedSeats.length > 0 && (
                <span className="text-rose-600 dark:text-rose-400 font-extrabold text-base">
                  ₹{totalPrice}
                </span>
              )}
            </div>
          </div>

          <button
            disabled={selectedSeats.length === 0}
            onClick={() => {
              onClose();
              onProceedToFood(selectedSeats, show);
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-extrabold text-sm shadow-xl hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Food & Combos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
