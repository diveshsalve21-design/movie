import React, { useState, useMemo } from 'react';
import { Star, Ticket, Film, Filter, Sparkles, Clock, Eye } from 'lucide-react';
import { Movie } from '../types/cinema';

interface MovieGridProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onBookMovie: (movie: Movie) => void;
  searchQuery: string;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  onSelectMovie,
  onBookMovie,
  searchQuery
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'now_showing' | 'coming_soon' | 'trending' | 'top_rated'>('now_showing');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'releaseDate' | 'title'>('rating');

  // Available unique genres & languages
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => m.genres.forEach((g) => set.add(g)));
    return ['All', ...Array.from(set)];
  }, [movies]);

  const allLanguages = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => m.languages.forEach((l) => set.add(l)));
    return ['All', ...Array.from(set)];
  }, [movies]);

  // Filter logic
  const filteredMovies = useMemo(() => {
    return movies
      .filter((m) => {
        // Search query
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = m.title.toLowerCase().includes(q);
          const matchesGenre = m.genres.some((g) => g.toLowerCase().includes(q));
          const matchesLang = m.languages.some((l) => l.toLowerCase().includes(q));
          if (!matchesTitle && !matchesGenre && !matchesLang) return false;
        }

        // Tab category
        if (activeTab === 'now_showing' && !m.isNowShowing) return false;
        if (activeTab === 'coming_soon' && !m.isComingSoon) return false;
        if (activeTab === 'trending' && !m.isTrending) return false;
        if (activeTab === 'top_rated' && !m.isTopRated) return false;

        // Genre
        if (selectedGenre !== 'All' && !m.genres.includes(selectedGenre)) return false;

        // Language
        if (selectedLanguage !== 'All' && !m.languages.includes(selectedLanguage)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.imdbRating - a.imdbRating;
        if (sortBy === 'releaseDate') return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        return a.title.localeCompare(b.title);
      });
  }, [movies, searchQuery, activeTab, selectedGenre, selectedLanguage, sortBy]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Category Tabs & Controls Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/10 pb-6">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-500">
          {[
            { id: 'now_showing', label: 'Now Showing' },
            { id: 'coming_soon', label: 'Coming Soon' },
            { id: 'trending', label: 'Trending' },
            { id: 'top_rated', label: 'Top Rated' },
            { id: 'all', label: 'All Movies' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-white text-white'
                  : 'border-transparent hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Minimal Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {/* Genre Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Genre:</span>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              {allGenres.map((g) => (
                <option key={g} value={g} className="text-black">
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="w-px h-4 bg-white/10 hidden sm:block" />

          {/* Language Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              {allLanguages.map((l) => (
                <option key={l} value={l} className="text-black">
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="w-px h-4 bg-white/10 hidden sm:block" />

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="rating" className="text-black">IMDb Rating</option>
              <option value="releaseDate" className="text-black">Release Date</option>
              <option value="title" className="text-black">Title A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <div className="py-24 text-center space-y-4">
          <Film className="w-12 h-12 mx-auto text-slate-700" />
          <h3 className="text-lg font-medium text-white">No movies found</h3>
          <p className="text-sm text-slate-500">Try adjusting your filters to find what you're looking for.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12">
          {filteredMovies.map((movie) => (
            <div key={movie.id} className="group relative flex flex-col space-y-4 cursor-pointer" onClick={() => onSelectMovie(movie)}>
              {/* Clean Image Container */}
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-black shadow-sm transition-transform duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Subtle Overlay Actions (visible on hover) */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookMovie(movie);
                    }}
                    className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-sm shadow-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-4 h-4" />
                    Book Now
                  </button>
                </div>

                {/* Rating Badge - Minimalist */}
                <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white font-semibold text-xs flex items-center gap-1.5">
                  <Star className="w-3 h-3 fill-white text-white" />
                  <span>{movie.imdbRating}</span>
                </div>
              </div>

              {/* Minimal Text Details */}
              <div className="space-y-1 px-1">
                <h3 className="text-base font-bold text-white leading-tight line-clamp-1 group-hover:text-slate-300 transition-colors">
                  {movie.title}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-1">
                  {movie.genres.slice(0, 2).join(', ')}
                </p>
                <div className="flex items-center gap-3 text-xs font-medium text-slate-500 pt-1">
                  <span>{movie.languages[0]}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  <span>{movie.runtimeMinutes}m</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  <span className="px-1.5 py-0.5 rounded-md border border-slate-800">{movie.ageRating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
