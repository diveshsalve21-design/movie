import React, { useState } from 'react';
import { Sparkles, X, Compass, CheckCircle2, Ticket, Flame, Heart, Zap, Smile, Eye } from 'lucide-react';
import { Movie } from '../types/cinema';

interface AIMoodFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
  onBookMovie: (movie: Movie) => void;
}

const MOODS = [
  { label: 'Mind-Bending & Sci-Fi', icon: Zap, color: 'from-purple-500 to-indigo-600' },
  { label: 'Thrilling & Action', icon: Flame, color: 'from-rose-500 to-orange-600' },
  { label: 'Heartwarming & Emotional', icon: Heart, color: 'from-pink-500 to-rose-500' },
  { label: 'Epic Mythological Adventure', icon: Compass, color: 'from-amber-500 to-yellow-600' },
  { label: 'Dark Mystery & Suspense', icon: Eye, color: 'from-slate-700 to-slate-900' }
];

export const AIMoodFinderModal: React.FC<AIMoodFinderModalProps> = ({
  isOpen,
  onClose,
  movies,
  onBookMovie
}) => {
  const [selectedMood, setSelectedMood] = useState('Thrilling & Action');
  const [selectedGenre, setSelectedGenre] = useState('Any');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<{
    movie: Movie;
    aiReasoning: string;
    vibeKeywords: string[];
    curatorTip: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleGetAIRecommendation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: selectedMood,
          genrePreference: selectedGenre
        })
      });
      const data = await res.json();
      if (data.success && data.recommendedMovieId) {
        const foundMovie = movies.find((m) => m.id === data.recommendedMovieId) || movies[0];
        setRecommendation({
          movie: foundMovie,
          aiReasoning: data.aiReasoning || `Perfect choice for your ${selectedMood} mood!`,
          vibeKeywords: data.vibeKeywords || ['Exciting', 'Visually Stunning'],
          curatorTip: data.curatorTip || 'Pair with salted popcorn and IMAX 3D recliners.'
        });
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setRecommendation({
        movie: movies[0],
        aiReasoning: 'Based on your craving for high stakes and spectacle, this movie delivers pure adrenaline!',
        vibeKeywords: ['Masterpiece', 'High Octane'],
        curatorTip: 'Experience in IMAX 3D for surround sound immersion.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">AI Movie Curator</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {!recommendation ? (
          <div className="py-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                1. What mood are you in right now?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {MOODS.map((m) => {
                  const Icon = m.icon;
                  const isSelected = selectedMood === m.label;
                  return (
                    <button
                      key={m.label}
                      onClick={() => setSelectedMood(m.label)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left text-xs font-semibold transition-all ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 shadow-md ring-2 ring-purple-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${m.color} text-white flex items-center justify-center shadow-sm`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                2. Preferred Genre
              </label>
              <div className="flex flex-wrap gap-2">
                {['Any', 'Sci-Fi', 'Action', 'Drama', 'Adventure', 'Comedy'].map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      selectedGenre === genre
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGetAIRecommendation}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-rose-600 to-indigo-600 text-white font-extrabold text-sm shadow-xl hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Cinema Catalog with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Find My Perfect Movie Match</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Recommendation Output */
          <div className="py-6 space-y-5 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                100% Match For Your Vibe
              </span>
              <button
                onClick={() => setRecommendation(null)}
                className="text-xs font-semibold text-slate-500 hover:text-purple-600"
              >
                &larr; Change Preferences
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <img
                src={recommendation.movie.poster}
                alt={recommendation.movie.title}
                className="w-full sm:w-32 h-44 object-cover rounded-xl shadow-lg"
              />
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {recommendation.movie.title}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {recommendation.vibeKeywords.map((vk, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                    >
                      #{vk}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{recommendation.aiReasoning}"
                </p>
                <div className="pt-1 text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Curator Tip: {recommendation.curatorTip}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onBookMovie(recommendation.movie);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-extrabold text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Ticket className="w-4 h-4" />
              <span>Book Tickets for {recommendation.movie.title}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
