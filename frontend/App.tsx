import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroCarousel } from './components/HeroCarousel';
import { MovieGrid } from './components/MovieGrid';
import { AIMoodFinderModal } from './components/AIMoodFinderModal';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { ShowtimeSelectorModal } from './components/ShowtimeSelectorModal';
import { InteractiveSeatMapModal } from './components/InteractiveSeatMapModal';
import { FoodComboSelectorModal } from './components/FoodComboSelectorModal';
import { BookingSummaryModal } from './components/BookingSummaryModal';
import { PaymentGatewayModal } from './components/PaymentGatewayModal';
import { TicketSuccessModal } from './components/TicketSuccessModal';
import { WalletModal } from './components/WalletModal';
import { UserDashboardModal } from './components/UserDashboardModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';

import { City, Movie, UserProfile, Show, Seat, FoodItem, Booking } from './types/cinema';
import { MOCK_CITIES, MOCK_USER, MOCK_MOVIES } from './mockData';

export default function App() {
  // Data State
  const [cities, setCities] = useState<City[]>(MOCK_CITIES);
  const [currentCity, setCurrentCity] = useState<City | null>(MOCK_CITIES[0]);
  const [movies, setMovies] = useState<Movie[]>(MOCK_MOVIES);
  const [user, setUser] = useState<UserProfile | null>(MOCK_USER);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals Flow State
  const [activeModal, setActiveModal] = useState<
    | 'none'
    | 'ai_mood'
    | 'movie_details'
    | 'showtimes'
    | 'seats'
    | 'food'
    | 'summary'
    | 'payment'
    | 'success'
    | 'wallet'
    | 'user_dashboard'
    | 'admin'
  >('none');

  // Selection Context
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [foodCart, setFoodCart] = useState<{ item: FoodItem; quantity: number }[]>([]);
  const [bookingData, setBookingData] = useState<any>(null);
  const [finalBooking, setFinalBooking] = useState<Booking | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // Initialize App (Force Dark Mode)
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    // Fetch initial data if backend API is available
    Promise.all([
      fetch('/api/cities').then(res => res.ok ? res.json() : null),
      fetch('/api/movies').then(res => res.ok ? res.json() : null),
      fetch('/api/user').then(res => res.ok ? res.json() : null)
    ])
    .then(([cData, mData, uData]) => {
      if (cData?.success) {
        setCities(cData.cities);
        setCurrentCity(cData.cities[0]);
      }
      if (mData?.success) setMovies(mData.movies);
      if (uData?.success) setUser(uData.user);
    })
    .catch((err) => {
      console.log('Backend API unavailable, using fallback static data:', err);
    });
  }, []);


  // Flow Handlers
  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setActiveModal('movie_details');
  };

  const handleBookMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setActiveModal('showtimes');
  };

  const handleSelectShowtime = (show: Show) => {
    setSelectedShow(show);
    setActiveModal('seats');
  };

  const handleProceedToFood = (seats: Seat[], show: Show) => {
    setSelectedSeats(seats);
    setSelectedShow(show);
    setActiveModal('food');
  };

  const handleProceedToSummary = (cart: { item: FoodItem; quantity: number }[]) => {
    setFoodCart(cart);
    setActiveModal('summary');
  };

  const handleProceedToPayment = (details: any) => {
    setBookingData(details);
    setActiveModal('payment');
  };

  const handlePaymentSuccess = (booking: Booking, points: number) => {
    setFinalBooking(booking);
    setEarnedPoints(points);
    if (user) {
      // Refresh user to get updated wallet/points locally
      fetch('/api/user').then(r => r.json()).then(d => {
        if(d.success) setUser(d.user);
      });
    }
    setActiveModal('success');
  };

  if (!currentCity || !user) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-white font-bold animate-pulse">Initializing BookNow Environment...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-slate-800">
      <Navbar 
        currentCity={currentCity}
        cities={cities}
        onSelectCity={setCurrentCity}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        user={user}
        onOpenAIMoodFinder={() => setActiveModal('ai_mood')}
        onOpenDashboard={() => setActiveModal('user_dashboard')}
        onOpenAdmin={() => setActiveModal('admin')}
        onOpenWalletModal={() => setActiveModal('wallet')}
      />

      <main className="pb-24">
        {/* Only show carousel if no search query */}
        {!searchQuery && (
          <HeroCarousel 
            movies={movies.filter(m => m.isTrending && m.poster && m.poster !== 'N/A' && !m.poster.includes('unsplash')).slice(0, 5)} 
            onSelectMovie={handleSelectMovie}
            onQuickBook={handleBookMovie}
            onWatchTrailer={(url) => { window.open(url, '_blank'); }}
          />
        )}
        
        <MovieGrid 
          movies={movies} 
          searchQuery={searchQuery}
          onSelectMovie={handleSelectMovie}
          onBookMovie={handleBookMovie}
        />
      </main>

      {/* Footer minimal */}
      <footer className="py-8 text-center text-xs font-medium text-slate-600 bg-black border-t border-slate-900">
        <p>&copy; 2026 BookNow Entertainment. Powered by AI Studio & Gemini.</p>
      </footer>

      {/* Modals Pipeline */}
      <AIMoodFinderModal 
        isOpen={activeModal === 'ai_mood'} 
        onClose={() => setActiveModal('none')} 
        movies={movies}
        onBookMovie={handleBookMovie}
      />
      
      <MovieDetailsModal 
        isOpen={activeModal === 'movie_details'}
        onClose={() => setActiveModal('none')}
        movie={selectedMovie}
        onBookMovie={handleBookMovie}
      />

      <ShowtimeSelectorModal
        isOpen={activeModal === 'showtimes'}
        onClose={() => setActiveModal('none')}
        movie={selectedMovie}
        currentCity={currentCity}
        onSelectShowtime={handleSelectShowtime}
      />

      <InteractiveSeatMapModal
        isOpen={activeModal === 'seats'}
        onClose={() => setActiveModal('none')}
        show={selectedShow}
        onProceedToFood={handleProceedToFood}
      />

      <FoodComboSelectorModal
        isOpen={activeModal === 'food'}
        onClose={() => setActiveModal('none')}
        selectedSeats={selectedSeats}
        show={selectedShow}
        onProceedToCheckout={handleProceedToSummary}
      />

      <BookingSummaryModal
        isOpen={activeModal === 'summary'}
        onClose={() => setActiveModal('none')}
        selectedSeats={selectedSeats}
        foodCart={foodCart}
        show={selectedShow}
        movie={selectedMovie}
        theatre={{ name: 'BookNow Partner Theatre' } as any} // Mock passing theatre details for simplicity
        user={user}
        onProceedToPayment={handleProceedToPayment}
      />

      <PaymentGatewayModal
        isOpen={activeModal === 'payment'}
        onClose={() => setActiveModal('none')}
        bookingData={bookingData}
        user={user}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <TicketSuccessModal
        isOpen={activeModal === 'success'}
        onClose={() => setActiveModal('none')}
        booking={finalBooking}
        earnedPoints={earnedPoints}
      />

      <WalletModal
        isOpen={activeModal === 'wallet'}
        onClose={() => setActiveModal('none')}
        user={user}
        onTopupSuccess={(b) => setUser({...user, walletBalance: b})}
      />

      <UserDashboardModal
        isOpen={activeModal === 'user_dashboard'}
        onClose={() => setActiveModal('none')}
        user={user}
      />

      <AdminDashboardModal
        isOpen={activeModal === 'admin'}
        onClose={() => setActiveModal('none')}
      />

    </div>
  );
}

