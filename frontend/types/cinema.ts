export type SeatCategory = 'VIP' | 'Premium' | 'Executive' | 'Normal';

export interface Seat {
  id: string;
  row: string;
  number: number;
  category: SeatCategory;
  price: number;
  isBooked: boolean;
  isSelected?: boolean;
}

export interface Movie {
  id: string;
  title: string;
  tagline: string;
  poster: string;
  backdrop: string;
  trailerUrl: string;
  synopsis: string;
  cast: { name: string; role: string; avatar: string }[];
  director: string;
  producer: string;
  runtimeMinutes: number;
  genres: string[];
  languages: string[];
  imdbRating: number;
  userRating: number;
  totalRatingsCount: number;
  ageRating: string; // e.g. "UA", "A", "U"
  releaseDate: string;
  screenshots: string[];
  isNowShowing: boolean;
  isComingSoon: boolean;
  isTrending: boolean;
  isTopRated: boolean;
  isExclusive: boolean;
  formats: ('2D' | '3D' | 'IMAX 3D' | '4DX' | 'Dolby Atmos')[];
}

export interface City {
  id: string;
  name: string;
  state: string;
  popularTheatresCount: number;
}

export interface Theatre {
  id: string;
  cityId: string;
  name: string;
  location: string;
  facilities: ('Parking' | 'Food Court' | 'Wheelchair Access' | 'Recliner Seats' | 'Dolby Atmos' | 'IMAX')[];
  rating: number;
  screens: Screen[];
}

export interface Screen {
  id: string;
  theatreId: string;
  name: string; // e.g. "Screen 1 - Audi 4K"
  totalSeats: number;
}

export interface Show {
  id: string;
  movieId: string;
  theatreId: string;
  screenId: string;
  date: string; // YYYY-MM-DD
  time: string; // "10:30 AM", "02:15 PM", "06:45 PM", "09:30 PM"
  format: '2D' | '3D' | 'IMAX 3D' | '4DX' | 'Dolby Atmos';
  language: string;
  priceVIP: number;
  pricePremium: number;
  priceExecutive: number;
  priceNormal: number;
  bookedSeatIds: string[];
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  category: 'Popcorn' | 'Combos' | 'Snacks' | 'Beverages';
  price: number;
  image: string;
  isVeg: boolean;
  popular?: boolean;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 20% or 100 flat
  minBookingAmount: number;
  description: string;
  expiryDate: string;
}

export interface Booking {
  id: string;
  bookingCode: string; // e.g. "CP-892341"
  userId: string;
  movieTitle: string;
  moviePoster: string;
  theatreName: string;
  screenName: string;
  city: string;
  showDate: string;
  showTime: string;
  format: string;
  seats: { row: string; number: number; category: SeatCategory; price: number }[];
  foodItems: { name: string; quantity: number; price: number }[];
  ticketPriceTotal: number;
  foodPriceTotal: number;
  convenienceFee: number;
  gst: number;
  discount: number;
  totalPaid: number;
  paymentMethod: string;
  paymentStatus: 'SUCCESS' | 'PENDING' | 'CANCELLED';
  bookingDate: string; // ISO string
  qrData: string;
}

export interface Review {
  id: string;
  movieId: string;
  userName: string;
  userAvatar: string;
  rating: number; // 1 to 10
  comment: string;
  createdAt: string;
  likesCount: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  walletBalance: number;
  rewardPoints: number;
  watchlist: string[]; // movie IDs
  favorites: string[]; // movie IDs
  referralCode: string;
}

export interface AdminAnalytics {
  totalRevenue: number;
  totalTicketsSold: number;
  totalMoviesActive: number;
  totalTheatres: number;
  dailyRevenue: { date: string; revenue: number; tickets: number }[];
  topMovies: { title: string; revenue: number; ticketsSold: number }[];
  genreDistribution: { genre: string; percentage: number }[];
}
