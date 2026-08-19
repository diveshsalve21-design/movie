import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Clock,
  Ticket,
  Play,
  Share2,
  Heart,
  MessageSquare,
  ThumbsUp,
  UserCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Movie, Review } from '../types/cinema';

interface MovieDetailsModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onBookMovie: (movie: Movie) => void;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  isOpen,
  onClose,
  onBookMovie
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showSeatPreview, setShowSeatPreview] = useState(false);
  const [userRating, setUserRating] = useState(10);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (movie) {
      fetch(`/api/movies/${movie.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setReviews(data.reviews || []);
          }
        })
        .catch(console.error);
    }
  }, [movie]);

  if (!isOpen || !movie) return null;

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/movies/${movie.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: userRating, comment: reviewComment })
      });
      const data = await res.json();
      if (data.success) {
        setReviews([data.review, ...reviews]);
        setReviewComment('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-y-auto my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Backdrop Banner */}
        <div className="relative h-64 sm:h-80 w-full bg-slate-950 overflow-hidden">
          <img
            src={movie.backdrop}
            alt={movie.title}
            className="w-full h-full object-cover filter brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />

          {/* Quick Trailer Button */}
          <button
            onClick={() => setShowTrailer(true)}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center shadow-2xl hover:bg-white/20 hover:scale-110 transition-all group border border-white/20"
          >
            <Play className="w-7 h-7 fill-white ml-1 group-hover:scale-105" />
          </button>
        </div>

        {/* Details Container */}
        <div className="px-6 sm:px-10 pb-10 -mt-20 relative z-10 space-y-8">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative w-36 sm:w-48 h-56 sm:h-72 rounded-2xl shadow-2xl border border-white/10 flex-shrink-0 overflow-hidden bg-black">
              <img
                src={movie.poster}
                alt={movie.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3 flex-1 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-black flex items-center gap-1 shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-black" />
                  <span>{movie.imdbRating} / 10 IMDb</span>
                </span>
                <span className="px-2.5 py-0.5 rounded bg-white/10 text-slate-300 font-bold text-xs border border-white/10">
                  {movie.ageRating}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {movie.runtimeMinutes} mins • {movie.languages.join(', ')}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white">
                {movie.title}
              </h1>
              <p className="text-slate-400 font-medium italic text-xs sm:text-sm line-clamp-3">
                "{movie.synopsis}"
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {movie.genres.map((g) => (
                  <span
                    key={g}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 text-slate-300 border border-white/5"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Action Toolbar */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onBookMovie(movie);
                  }}
                  className="px-8 py-3.5 rounded-full bg-white text-black font-bold text-sm shadow-xl hover:bg-slate-200 transition-all flex items-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Book Tickets</span>
                </button>

                <button
                  onClick={() => setShowSeatPreview(true)}
                  className="px-6 py-3.5 rounded-full bg-white/5 text-white border border-white/10 font-bold text-sm flex items-center gap-1.5 hover:bg-white/10 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>3D View</span>
                </button>

                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-3.5 rounded-full border transition-colors ${
                    isFavorite
                      ? 'bg-white/10 text-white border-white/20'
                      : 'bg-transparent text-slate-400 border-white/10 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-2">
            <h2 className="text-base font-bold text-white">Synopsis</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {movie.synopsis}
            </p>
          </div>

          {/* Cast & Crew */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white">Cast & Crew</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {movie.cast.map((actor, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/5"
                >
                  <img
                    src={actor.avatar}
                    alt={actor.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{actor.name}</h4>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{actor.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Reviews Section */}
          <div className="space-y-6 pt-4 border-t border-white/10">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-white" />
              <span>Audience Reviews ({reviews.length})</span>
            </h2>

            {/* Add Review Form */}
            <form onSubmit={handleAddReview} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Rate & Review Movie
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-400">Your Rating:</span>
                <div className="flex items-center gap-1">
                  {[2, 4, 6, 8, 10].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setUserRating(starVal)}
                      className="p-1 text-white hover:scale-110 transition-transform"
                    >
                      <Star className={`w-5 h-5 ${userRating >= starVal ? 'fill-white' : 'text-slate-600'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold ml-2 text-white">{userRating} / 10</span>
                </div>
              </div>

              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Write your honest movie thoughts..."
                rows={2}
                className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-white/30 focus:outline-none transition-colors placeholder:text-slate-600"
              />

              <button
                type="submit"
                disabled={submittingReview}
                className="px-5 py-2 rounded-xl bg-white text-black text-xs font-bold hover:opacity-90 transition-opacity"
              >
                {submittingReview ? 'Posting...' : 'Submit Review'}
              </button>
            </form>

            {/* Reviews Feed */}
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={rev.userAvatar} alt={rev.userName} className="w-7 h-7 rounded-full" />
                      <span className="text-xs font-bold text-white">{rev.userName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white text-xs font-extrabold">
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>{rev.rating}/10</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal Overlay */}
      {showTrailer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute top-4 right-4 z-[70] p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={`${movie.trailerUrl}?autoplay=1`}
              title={movie.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* 3D Seat View Preview Modal */}
      {showSeatPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="relative w-full max-w-2xl p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Interactive 3D Auditorium View</span>
              </h3>
              <button onClick={() => setShowSeatPreview(false)} className="p-1 rounded bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Camera Projection View */}
            <div className="relative h-64 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 border border-slate-700 flex flex-col items-center justify-center">
              {/* Curved Curved Screen */}
              <div className="w-3/4 h-2 rounded-full bg-gradient-to-r from-purple-500 via-rose-500 to-amber-400 shadow-[0_0_30px_rgba(244,63,94,0.8)] mb-8" />
              <span className="text-[10px] uppercase tracking-widest text-slate-400 mb-6">4K Laser Curved Screen</span>

              {/* Seats Rows Perspective Grid */}
              <div className="w-full px-12 grid grid-cols-8 gap-2 text-center opacity-60">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="h-4 rounded bg-purple-600/40 border border-purple-400/30" />
                ))}
              </div>

              <div className="absolute bottom-3 text-xs text-purple-300 font-semibold bg-slate-950/80 px-4 py-1 rounded-full">
                Eye-level sightline from VIP Recliner Row B
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
