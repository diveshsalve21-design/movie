import { City, Movie, UserProfile, Theatre, Show, FoodItem, Seat } from './types/cinema';

export const MOCK_CITIES: City[] = [
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', popularTheatresCount: 42 },
  { id: 'delhi', name: 'Delhi NCR', state: 'Delhi', popularTheatresCount: 38 },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', popularTheatresCount: 35 }
];

export const MOCK_USER: UserProfile = {
  id: 'u1',
  name: 'Vinit Satve',
  email: 'satvevinit@gmail.com',
  phone: '8830292804',
  avatar: '',
  walletBalance: 1000,
  rewardPoints: 150,
  watchlist: [],
  favorites: [],
  referralCode: 'BOOKNOW100'
};

export const MOCK_THEATRES: Theatre[] = [
  { id: 't1', cityId: 'mumbai', name: 'PVR Juhu', location: 'Juhu, Mumbai', rating: 4.6, facilities: ['IMAX', 'Dolby Atmos', 'Parking'], screens: [] },
  { id: 't2', cityId: 'mumbai', name: 'INOX R City', location: 'Ghatkopar, Mumbai', rating: 4.4, facilities: ['Food Court', 'Recliner Seats', 'Parking'], screens: [] },
  { id: 't3', cityId: 'mumbai', name: 'Cinepolis Andheri', location: 'Andheri West, Mumbai', rating: 4.5, facilities: ['Dolby Atmos', 'Wheelchair Access'], screens: [] },
  { id: 't4', cityId: 'mumbai', name: 'PVR Phoenix', location: 'Lower Parel, Mumbai', rating: 4.7, facilities: ['IMAX', 'Recliner Seats', 'Food Court'], screens: [] }
];

export const MOCK_FOOD_ITEMS: FoodItem[] = [
  { id: 'f1', name: 'Classic Popcorn', description: 'Freshly popped salted popcorn', price: 250, category: 'Popcorn', image: 'images/food/popcorn.jpg', isVeg: true, popular: true },
  { id: 'f2', name: 'Movie Combo', description: 'Popcorn and a chilled drink', price: 399, category: 'Combos', image: 'images/food/movie-combo.jpg', isVeg: true, popular: true },
  { id: 'f3', name: 'Nachos', description: 'Crisp nachos with cheesy dip', price: 220, category: 'Snacks', image: 'images/food/nachos.jpg', isVeg: true },
  { id: 'f4', name: 'Cold Coffee', description: 'Iced coffee with cream', price: 180, category: 'Beverages', image: 'images/food/cold-coffee.jpg', isVeg: true }
];

const REAL_MOVIE_TITLES = [
  "Inception", "Interstellar", "The Dark Knight", "Parasite", "Spirited Away", "The Godfather", "Pulp Fiction", "The Shawshank Redemption", "The Lord of the Rings: The Return of the King", "The Matrix",
  "Gladiator", "Whiplash", "Mad Max: Fury Road", "The Grand Budapest Hotel", "La La Land", "Dune", "Everything Everywhere All at Once", "Oppenheimer", "Barbie", "Top Gun: Maverick",
  "The Batman", "Black Panther", "Spider-Man: Into the Spider-Verse", "Avengers: Endgame", "Coco", "Your Name", "The Lion King", "Jurassic Park", "The Silence of the Lambs", "Get Out",
  "Knives Out", "The Social Network", "Arrival", "Blade Runner 2049", "The Prestige", "The Truman Show", "The Departed", "The Wolf of Wall Street", "12 Angry Men", "The Good, the Bad and the Ugly",
  "The Princess Bride", "The Breakfast Club", "Alien", "The Thing", "The Exorcist", "Jaws", "The Shining", "The Green Mile", "The Sixth Sense", "Fight Club"
];

export const MOCK_MOVIES: Movie[] = REAL_MOVIE_TITLES.map((title, index) => {
  const num = (index + 1).toString().padStart(2, '0');
  const posterPath = `images/posters/${num}.webp`;
  return {
    id: `m${index + 1}`,
    title: title,
    tagline: `A captivating cinema story.`,
    poster: posterPath,
    backdrop: posterPath,
    trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    synopsis: `${title} follows an unforgettable journey filled with heart, surprises, and cinematic spectacle.`,
    cast: [],
    director: "BookNow Studios",
    producer: "BookNow Pictures",
    runtimeMinutes: 120 + (index % 5) * 15,
    genres: index % 2 === 0 ? ["Drama", "Action"] : ["Sci-Fi", "Thriller"],
    languages: ["English", "Hindi"],
    imdbRating: Number((7.0 + (index % 25) / 10).toFixed(1)),
    userRating: 4.5,
    totalRatingsCount: 1200 + index * 50,
    ageRating: "UA",
    releaseDate: "2025-01-01",
    screenshots: [],
    isNowShowing: true,
    isComingSoon: false,
    isTrending: index % 3 === 0,
    isTopRated: index % 4 === 0,
    isExclusive: index % 7 === 0,
    formats: ["2D", "3D", "IMAX 3D"]
  };
});

export function generateMockShows(movieId: string, dateStr: string): Show[] {
  const slots = [
    { time: '10:30 AM', format: '2D', price: 180 },
    { time: '02:15 PM', format: '3D', price: 220 },
    { time: '06:00 PM', format: 'IMAX 3D', price: 300 },
    { time: '09:30 PM', format: '2D', price: 200 }
  ];

  return MOCK_THEATRES.flatMap((theatre) =>
    slots.map((slot, idx) => ({
      id: `s-${movieId}-${theatre.id}-${dateStr}-${idx}`,
      movieId,
      theatreId: theatre.id,
      screenId: `${theatre.id}-sc${idx + 1}`,
      date: dateStr,
      time: slot.time,
      format: slot.format as any,
      language: 'English',
      priceVIP: slot.price + 250,
      pricePremium: slot.price + 100,
      priceExecutive: slot.price + 40,
      priceNormal: slot.price,
      bookedSeatIds: ['A3', 'A4', 'B5', 'C6']
    }))
  );
}

export function generateMockSeats(): Seat[] {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seats: Seat[] = [];
  const bookedSet = new Set(['A3', 'A4', 'B5', 'C6', 'D2']);

  rows.forEach((row) => {
    let category: any = 'Normal';
    let price = 180;

    if (row === 'A' || row === 'B') {
      category = 'VIP';
      price = 430;
    } else if (row === 'C' || row === 'D') {
      category = 'Premium';
      price = 280;
    } else if (row === 'E' || row === 'F') {
      category = 'Executive';
      price = 220;
    }

    for (let num = 1; num <= 12; num++) {
      const id = `${row}${num}`;
      seats.push({
        id,
        row,
        number: num,
        category,
        price,
        isBooked: bookedSet.has(id)
      });
    }
  });

  return seats;
}
