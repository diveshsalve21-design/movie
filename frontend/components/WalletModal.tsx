import React, { useState } from 'react';
import { X, Wallet, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types/cinema';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onTopupSuccess: (newBalance: number) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  user,
  onTopupSuccess
}) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTopup = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;

    setLoading(true);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/user/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numAmount })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        setAmount('');
        setTimeout(() => {
          onTopupSuccess(data.walletBalance);
          setSuccessMsg(null);
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center shadow-lg">
            <Wallet className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">BookNow Wallet</h2>
          <p className="text-xs text-slate-500">Current Balance: <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{user.walletBalance}</span></p>
        </div>

        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Enter Top-up Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-lg font-black text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {[500, 1000, 2000].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val.toString())}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                +₹{val}
              </button>
            ))}
          </div>
          
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            onClick={handleTopup}
            disabled={loading || !amount || Number(amount) <= 0}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : 'Add Money to Wallet'}
          </button>
        </div>
      </div>
    </div>
  );
};
