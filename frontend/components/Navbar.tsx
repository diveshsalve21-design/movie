import React, { useState } from 'react';
import {
  Film,
  MapPin,
  Search,
  Sparkles,
  User,
  Wallet,
  Sun,
  Moon,
  ShieldCheck,
  Ticket,
  ChevronDown
} from 'lucide-react';
import { City, UserProfile } from '../types/cinema';

interface NavbarProps {
  currentCity: City;
  cities: City[];
  onSelectCity: (city: City) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  user: UserProfile;
  onOpenAIMoodFinder: () => void;
  onOpenDashboard: () => void;
  onOpenAdmin: () => void;
  onOpenWalletModal: () => void;
}

const BookNowLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <mask id="b-mask">
      <rect width="100" height="100" fill="white" />
      <circle cx="20" cy="10" r="12" fill="black" />
      <circle cx="20" cy="90" r="12" fill="black" />
      <line x1="32" y1="25" x2="32" y2="75" stroke="black" strokeWidth="6" strokeDasharray="8 6" strokeLinecap="round" />
      <path d="M 50 25 L 68 34 L 50 43 Z" fill="black" />
      <rect x="48" y="58" width="24" height="18" rx="8" fill="black" />
    </mask>
    <path mask="url(#b-mask)" d="M20,10 H65 C85,10 92,22 92,32 C92,44 85,48 76,49 C92,51 98,62 98,72 C98,90 75,90 65,90 H20 Z" />
  </svg>
);

export const Navbar: React.FC<NavbarProps> = ({
  currentCity,
  cities,
  onSelectCity,
  searchQuery,
  onSearchChange,
  user,
  onOpenAIMoodFinder,
  onOpenDashboard,
  onOpenAdmin,
  onOpenWalletModal
}) => {
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-black/70 border-b border-white/5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center transition-transform group-hover:scale-105 shadow-md shadow-white/20">
            <BookNowLogo className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">
              BookNow
            </span>
          </div>
        </div>

        {/* Location Selector */}
        <div className="relative">
          <button
            onClick={() => setShowCityDropdown(!showCityDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          >
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="hidden xs:inline">{currentCity.name}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </button>

          {showCityDropdown && (
            <div className="absolute top-full left-0 mt-2 w-56 rounded-xl bg-[#0f0f0f] shadow-2xl border border-white/10 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 text-xs font-medium text-slate-500">Select City</div>
              {cities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => {
                    onSelectCity(city);
                    setShowCityDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-white/5 transition-colors ${
                    city.id === currentCity.id ? 'text-white font-medium bg-white/5' : 'text-slate-400'
                  }`}
                >
                  <span>{city.name}</span>
                  <span className="text-xs text-slate-400">{city.popularTheatresCount} Theatres</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block relative">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-slate-300" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm rounded-full bg-white/5 border border-transparent focus:border-white/20 focus:bg-white/10 text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* AI Recommendation Button */}
        <button
          onClick={onOpenAIMoodFinder}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium transition-colors border border-white/10"
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        {/* Wallet Badge */}
        <button
          onClick={onOpenWalletModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-medium transition-colors"
        >
          <Wallet className="w-3.5 h-3.5 text-slate-400" />
          <span>₹{user.walletBalance}</span>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-2">
          {/* Admin Panel Link */}
          <button
            onClick={onOpenAdmin}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Admin Dashboard Portal"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={onOpenDashboard}
            className="flex items-center gap-2 p-0.5 rounded-full ring-2 ring-white/10 hover:ring-white/30 transition-all"
            title="User Profile & Bookings"
          >
            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
