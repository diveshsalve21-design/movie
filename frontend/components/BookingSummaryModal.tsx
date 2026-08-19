import React, { useState, useEffect } from 'react';
import { X, Ticket, Tag, Clock, Check, AlertCircle, ShieldCheck, CreditCard, ArrowRight } from 'lucide-react';
import { FoodItem, Seat, Show, Movie, Theatre, UserProfile } from '../types/cinema';

interface BookingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeats: Seat[];
  foodCart: { item: FoodItem; quantity: number }[];
  show: Show | null;
  movie: Movie | null;
  theatre: Theatre | null;
  user: UserProfile;
  onProceedToPayment: (bookingDetails: any) => void;
}

export const BookingSummaryModal: React.FC<BookingSummaryModalProps> = ({
  isOpen,
  onClose,
  selectedSeats,
  foodCart,
  show,
  movie,
  theatre,
  user,
  onProceedToPayment
}) => {
  const [couponCode, setCouponCode] = useState('WELCOME100');
  const [discountAmount, setDiscountAmount] = useState(100);
  const [couponSuccess, setCouponSuccess] = useState<string | null>('Flat ₹100 Off Applied');
  const [couponError, setCouponError] = useState<string | null>(null);

  // 10-minute expiry countdown timer
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(600);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen || !show || !movie) return null;

  const ticketSubtotal = selectedSeats.reduce((acc, s) => acc + s.price, 0);
  const foodSubtotal = foodCart.reduce((acc, c) => acc + c.item.price * c.quantity, 0);
  const convenienceFee = 35;
  const gst = Math.round((ticketSubtotal + foodSubtotal) * 0.18);
  const totalPayable = Math.max(0, ticketSubtotal + foodSubtotal + convenienceFee + gst - discountAmount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, bookingAmount: ticketSubtotal + foodSubtotal })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDiscountAmount(Number(data.discountAmount ?? data.discount ?? 0));
          setCouponSuccess(data.description || `Coupon applied: ₹${data.discountAmount ?? data.discount ?? 0} off`);
          return;
        } else {
          setDiscountAmount(0);
          setCouponError(data.message || 'Invalid coupon code');
          return;
        }
      }
      throw new Error('API offline');
    } catch (err) {
      console.log('Backend API offline, checking coupon locally:', err);
      const cleanCode = couponCode.trim().toUpperCase();
      if (cleanCode === 'WELCOME50' || cleanCode === 'BOOKNOW50' || cleanCode === 'OFFER50') {
        setDiscountAmount(50);
        setCouponSuccess(`Coupon '${cleanCode}' applied: ₹50 discount!`);
      } else if (cleanCode === 'PROMO100' || cleanCode === 'SAVE100') {
        setDiscountAmount(100);
        setCouponSuccess(`Coupon '${cleanCode}' applied: ₹100 discount!`);
      } else {
        setDiscountAmount(0);
        setCouponError('Invalid promo code. Try WELCOME50');
      }
    }
  };

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Booking Summary</h2>
            <div className="text-xs font-semibold text-rose-500 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>
                Session expires in: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Movie Ticket Card Info */}
        <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
          <img src={movie.poster} alt={movie.title} className="w-16 h-24 object-cover rounded-xl shadow-md" />
          <div className="space-y-1 text-xs">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{movie.title}</h3>
            <p className="text-slate-500">{theatre?.name}</p>
            <p className="font-semibold text-rose-600 dark:text-rose-400">
              {show.date} at {show.time} ({show.format})
            </p>
            <p className="font-extrabold text-slate-800 dark:text-slate-200">
              Seats: {selectedSeats.map((s) => s.id).join(', ')} ({selectedSeats.length} Tickets)
            </p>
          </div>
        </div>

        {/* Promo Code Entry */}
        <form onSubmit={handleApplyCoupon} className="space-y-2">
          <label className="block text-xs font-bold uppercase text-slate-500">Apply Promo / Coupon Code</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="e.g. WELCOME100, CINEMA20"
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold uppercase text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90"
            >
              Apply
            </button>
          </div>
          {couponSuccess && <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1"><Check className="w-3 h-3" />{couponSuccess}</p>}
          {couponError && <p className="text-[11px] text-rose-500 font-bold">{couponError}</p>}
        </form>

        {/* Itemized Price Breakdown Table */}
        <div className="space-y-2 text-xs border-t border-b border-slate-200 dark:border-slate-800 py-3">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Ticket Subtotal ({selectedSeats.length} seats)</span>
            <span>₹{ticketSubtotal}</span>
          </div>

          {foodSubtotal > 0 && (
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Food & Beverage Combo</span>
              <span>₹{foodSubtotal}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Convenience Fee</span>
            <span>₹{convenienceFee}</span>
          </div>

          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Integrated GST (18%)</span>
            <span>₹{gst}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
              <span>Coupon Discount</span>
              <span>-₹{discountAmount}</span>
            </div>
          )}

          <div className="pt-2 flex justify-between text-sm font-black text-slate-900 dark:text-white border-t border-slate-100 dark:border-slate-800">
            <span>Amount Payable</span>
            <span className="text-rose-600 dark:text-rose-400">₹{totalPayable}</span>
          </div>
        </div>

        {/* Proceed Button */}
        <button
          onClick={() => {
            onClose();
            onProceedToPayment({
              showId: show.id,
              seats: selectedSeats,
              foodItems: foodCart.map((f) => ({ name: f.item.name, quantity: f.quantity, price: f.item.price })),
              discountAmount,
              totalPayable
            });
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-extrabold text-sm shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          <span>Pay ₹{totalPayable} Now</span>
        </button>
      </div>
    </div>
  );
};
