import React, { useState, useEffect } from 'react';
import { Play, Ticket, Star, Clock, Sparkles, Volume2 } from 'lucide-react';
import { Movie } from '../types/cinema';

interface HeroCarouselProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onQuickBook: (movie: Movie) => void;
  onWatchTrailer: (url: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  movies,
  onSelectMovie,
  onQuickBook,
  onWatchTrailer
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTrailerUrl, setShowTrailerUrl] = useState<string | null>(null);

  // Auto slider
  useEffect(() => {
    if (movies.length === 0 || showTrailerUrl) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [movies.length, showTrailerUrl]);

  if (!movies || movies.length === 0) return null;
  const activeMovie = movies[currentIndex];

  return (
    <div className="relative w-full h-[60vh] min-h-[500px] max-h-[700px] overflow-hidden bg-slate-950 text-white">
      {/* Background Backdrop Image */}
      <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out bg-black overflow-hidden">
        <img
          key={`bg-${activeMovie.id}`}
          src={activeMovie.backdrop || activeMovie.poster}
          alt="backdrop"
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.6] contrast-110"
        />
        
        {/* Gradients to blend video into the background */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-8">
        <div key={activeMovie.id} className="max-w-2xl py-8 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.1]">
              {activeMovie.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-200 font-medium max-w-xl leading-relaxed line-clamp-3">
              {activeMovie.synopsis}
            </p>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-slate-300 tracking-wide">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{activeMovie.imdbRating}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>{activeMovie.runtimeMinutes} min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>{activeMovie.genres.slice(0, 2).join(', ')}</span>
            </div>
            <span className="px-2 py-0.5 rounded-md border border-slate-600 text-slate-300">
              {activeMovie.ageRating}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onQuickBook(activeMovie)}
              className="px-8 py-3.5 rounded-full bg-white text-slate-900 font-bold text-sm hover:bg-slate-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Ticket className="w-4 h-4" />
              <span>Book Tickets</span>
            </button>

            <button
              onClick={() => setShowTrailerUrl(activeMovie.trailerUrl)}
              className="px-8 py-3.5 rounded-full bg-slate-900/40 hover:bg-slate-900/60 text-white font-bold text-sm backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Watch Trailer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide Indicators - Minimalist */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {movies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Trailer Overlay */}
      {showTrailerUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
            <button
              onClick={() => setShowTrailerUrl(null)}
              className="absolute top-4 right-4 z-[110] p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <iframe
              src={`${showTrailerUrl}?autoplay=1`}
              title="Movie Trailer"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};
