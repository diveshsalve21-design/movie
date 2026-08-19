import React, { useState } from 'react';
import { X, Wallet, CreditCard, QrCode, ShieldCheck, CheckCircle2, Lock, Building, DollarSign } from 'lucide-react';
import { UserProfile } from '../types/cinema';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: any;
  user: UserProfile;
  onPaymentSuccess: (booking: any, earnedPoints: number) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  bookingData,
  user,
  onPaymentSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'Wallet' | 'UPI' | 'Card' | 'NetBanking' | 'PayPal'>('Wallet');
  const [upiId, setUpiId] = useState('vinit@upi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !bookingData) return null;

  const handlePay = async () => {
    setProcessing(true);
    setErrorMessage(null);

    const paymentMethodName =
      selectedMethod === 'Wallet'
        ? 'BookNow Wallet'
        : selectedMethod === 'UPI'
        ? `UPI (${upiId})`
        : selectedMethod === 'Card'
        ? 'Credit / Debit Card'
        : selectedMethod === 'NetBanking'
        ? 'Net Banking'
        : 'PayPal';

    try {
      let booking;
      let points = 0;

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showId: bookingData.showId,
          seats: bookingData.seats,
          foodItems: bookingData.foodItems,
          discountAmount: bookingData.discountAmount,
          paymentMethod: paymentMethodName
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          booking = data.booking;
          points = data.earnedPoints;
        } else {
          setProcessing(false);
          setErrorMessage(data.message || 'Payment processing failed.');
          return;
        }
      } else {
        throw new Error('API offline');
      }

      setTimeout(() => {
        setProcessing(false);
        onClose();
        onPaymentSuccess(booking, points);
      }, 1200);
    } catch (err) {
      console.log('Backend API offline, generating local ticket:', err);
      const ticketSubtotal = selectedSeats.reduce((a, s) => a + s.price, 0);
      const foodSubtotal = foodCart.reduce((a, c) => a + c.item.price * c.quantity, 0);
      const convenienceFee = 35;
      const gst = Math.round((ticketSubtotal + foodSubtotal) * 0.18);
      const totalPaid = Math.max(0, ticketSubtotal + foodSubtotal + convenienceFee + gst - (bookingData?.discountAmount || 0));
      const earnedPoints = Math.round(ticketSubtotal * 0.1);

      const localBooking = {
        id: `b-${Date.now()}`,
        bookingCode: `CP-${Math.floor(10000 + Math.random() * 90000)}`,
        userId: user?.id || 'u1',
        movieTitle: selectedMovie?.title || 'Selected Movie',
        moviePoster: selectedMovie?.poster || '',
        theatreName: selectedShow?.theatreId || 'PVR Cinemas',
        screenName: selectedShow?.screenId || 'Screen 1',
        city: 'Mumbai',
        showDate: selectedShow?.date || new Date().toISOString().split('T')[0],
        showTime: selectedShow?.time || '18:00',
        format: selectedShow?.format || 'IMAX 3D',
        seats: selectedSeats,
        foodItems: foodCart,
        ticketPriceTotal: ticketSubtotal,
        foodPriceTotal: foodSubtotal,
        convenienceFee,
        gst,
        discount: bookingData?.discountAmount || 0,
        bookingDate: new Date().toISOString().split('T')[0],
        qrData: `BOOKNOW:${selectedShow?.id || 's1'}:${selectedSeats.map((s) => s.id).join(',')}`,
        totalPaid,
        paymentMethod: paymentMethodName,
        paymentStatus: 'SUCCESS'
      };

      setTimeout(() => {
        setProcessing(false);
        onClose();
        onPaymentSuccess(localBooking, earnedPoints);
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Processing State Overlay */}
        {processing && (
          <div className="absolute inset-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-4 text-center">
            <div className="w-16 h-16 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Authorizing Payment...</h3>
            <p className="text-xs text-slate-500">Connecting securely with Bank Gateway & Syncing Seats</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-500" />
              <span>Secure Payment Gateway</span>
            </h2>
            <p className="text-xs text-slate-500">256-bit SSL Encrypted Transaction</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Header */}
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold uppercase text-rose-600 dark:text-rose-400">Total Amount</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">₹{bookingData.totalPayable}</div>
          </div>
          <ShieldCheck className="w-8 h-8 text-rose-500 opacity-80" />
        </div>

        {/* Payment Methods Choice */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase text-slate-500">Select Payment Mode</label>

          {/* Wallet Option */}
          <button
            onClick={() => setSelectedMethod('Wallet')}
            className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
              selectedMethod === 'Wallet'
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">BookNow Wallet</h4>
                <p className="text-[10px] text-slate-500">Balance: ₹{user.walletBalance}</p>
              </div>
            </div>
            {user.walletBalance < bookingData.totalPayable ? (
              <span className="text-[10px] font-bold text-rose-500">Insufficient</span>
            ) : (
              <span className="text-xs font-extrabold text-emerald-600">Available</span>
            )}
          </button>

          {/* UPI Option */}
          <button
            onClick={() => setSelectedMethod('UPI')}
            className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
              selectedMethod === 'UPI'
                ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">UPI / GPay / PhonePe</h4>
                <p className="text-[10px] text-slate-500">Instant QR scan & pay</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400">&rarr;</span>
          </button>

          {/* Card Option */}
          <button
            onClick={() => setSelectedMethod('Card')}
            className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
              selectedMethod === 'Card'
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Credit / Debit Card</h4>
                <p className="text-[10px] text-slate-500">Visa, Mastercard, RuPay</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400">&rarr;</span>
          </button>

          {/* NetBanking Option */}
          <button
            onClick={() => setSelectedMethod('NetBanking')}
            className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
              selectedMethod === 'NetBanking'
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Net Banking</h4>
                <p className="text-[10px] text-slate-500">All Indian Banks</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400">&rarr;</span>
          </button>

          {/* PayPal Option */}
          <button
            onClick={() => setSelectedMethod('PayPal')}
            className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
              selectedMethod === 'PayPal'
                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">PayPal</h4>
                <p className="text-[10px] text-slate-500">International Payments</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400">&rarr;</span>
          </button>
        </div>

        {errorMessage && (
          <p className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/50 p-3 rounded-xl">
            {errorMessage}
          </p>
        )}

        {/* Submit Pay Button */}
        <button
          onClick={handlePay}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-extrabold text-sm shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
        >
          <span>Complete Payment of ₹{bookingData.totalPayable}</span>
        </button>
      </div>
    </div>
  );
};
