import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { CheckCircle2, Download, Share2, Ticket, Sparkles, X, MapPin, Calendar, Clock, Film } from 'lucide-react';
import { Booking } from '../types/cinema';

interface TicketSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  earnedPoints: number;
}

export const TicketSuccessModal: React.FC<TicketSuccessModalProps> = ({
  isOpen,
  onClose,
  booking,
  earnedPoints
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen && booking) {
      // Fire confetti burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Generate QR Code
      QRCode.toDataURL(booking.qrData || booking.bookingCode, { width: 200, margin: 1 })
        .then(setQrDataUrl)
        .catch(console.error);
    }
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const handleDownloadTicket = () => {
    const ticketText = `
=== CINEPASS DIGITAL TICKET ===
Booking ID: ${booking.bookingCode}
Movie: ${booking.movieTitle} (${booking.format})
Theatre: ${booking.theatreName}
Show: ${booking.showDate} at ${booking.showTime}
Seats: ${booking.seats.map((s) => s.row + s.number).join(', ')}
Total Paid: ₹${booking.totalPaid}
Status: CONFIRMED
===============================
    `;
    const blob = new Blob([ticketText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BookNow-Ticket-${booking.bookingCode}.txt`;
    a.click();
  };

  const handleShareTicket = () => {
    if (navigator.share) {
      navigator.share({
        title: `Movie Ticket: ${booking.movieTitle}`,
        text: `I just booked tickets for ${booking.movieTitle} at ${booking.theatreName}! Booking ID: ${booking.bookingCode}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`Booking ID: ${booking.bookingCode} for ${booking.movieTitle}`);
      alert('Ticket booking code copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden my-auto">
        {/* Confetti Success Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Booking Confirmed!</h2>
          <p className="text-xs text-slate-500">Your digital ticket has been issued successfully.</p>

          {earnedPoints > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+{earnedPoints} Reward Points Earned!</span>
            </div>
          )}
        </div>

        {/* Styled Digital Ticket Card */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white p-5 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex justify-between items-start border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-400">
                Booking ID: {booking.bookingCode}
              </span>
              <h3 className="text-lg font-black text-white">{booking.movieTitle}</h3>
              <p className="text-xs text-slate-400">{booking.format} • {booking.city}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
              CONFIRMED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Cinema</span>
              <p className="font-bold text-white line-clamp-1">{booking.theatreName}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Seats</span>
              <p className="font-black text-amber-300">
                {booking.seats.map((s) => s.row + s.number).join(', ')}
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Show Date & Time</span>
              <p className="font-semibold text-slate-200">{booking.showDate} • {booking.showTime}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Total Paid</span>
              <p className="font-extrabold text-rose-400">₹{booking.totalPaid}</p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <div className="text-[10px] text-slate-400 space-y-1">
              <p>Scan QR code at usher entry point</p>
              <p className="text-emerald-400 font-semibold">Payment: {booking.paymentMethod}</p>
            </div>
            {qrDataUrl && (
              <img src={qrDataUrl} alt="Ticket QR Code" className="w-16 h-16 rounded-lg bg-white p-1 shadow-md" />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleDownloadTicket}
            className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          <button
            onClick={handleShareTicket}
            className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-rose-600 text-white font-extrabold text-xs shadow-lg hover:bg-rose-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
