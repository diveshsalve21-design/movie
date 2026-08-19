from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import time
from datetime import date, timedelta
from typing import List, Optional, Any
from urllib.parse import quote
try:
    from google import genai
except ImportError:
    genai = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Demo catalogue data
MOVIE_SEEDS = [
    ("Beetlejuice", ["Comedy", "Fantasy"], ["English"]), ("Midnight Signal", ["Thriller", "Mystery"], ["English"]),
    ("Monsoon Diaries", ["Drama", "Romance"], ["Hindi"]), ("Neon Horizon", ["Science Fiction", "Action"], ["English"]),
    ("The Last Encore", ["Music", "Drama"], ["English"]), ("Chennai Expressway", ["Action", "Comedy"], ["Tamil"]),
    ("Starlight", ["Romance", "Drama"], ["Hindi"]), ("Wild City", ["Crime", "Thriller"], ["English"]),
    ("The Blue Hour", ["Mystery", "Drama"], ["Malayalam"]), ("Paper Planes", ["Family", "Adventure"], ["English"]),
    ("Raja Returns", ["Action", "Drama"], ["Hindi"]), ("Orbit", ["Science Fiction", "Adventure"], ["English"]),
    ("Coastal Road", ["Drama", "Comedy"], ["Marathi"]), ("Echo Valley", ["Horror", "Mystery"], ["English"]),
    ("City of Lanterns", ["Fantasy", "Adventure"], ["Hindi"]), ("The Silent Sea", ["Thriller", "Drama"], ["Korean"]),
    ("Golden Frame", ["Romance", "Comedy"], ["Telugu"]), ("After the Rain", ["Drama", "Romance"], ["English"]),
    ("Red Line", ["Action", "Thriller"], ["Hindi"]), ("Moonlit Market", ["Comedy", "Family"], ["Gujarati"]),
    ("Parallel", ["Science Fiction", "Mystery"], ["English"]), ("The Runaway", ["Adventure", "Drama"], ["Tamil"]),
    ("Velvet Sky", ["Romance", "Music"], ["Hindi"]), ("Code Zero", ["Action", "Thriller"], ["English"]),
    ("Small Town Stars", ["Comedy", "Drama"], ["Malayalam"]), ("The Hidden Door", ["Fantasy", "Family"], ["English"]),
    ("Mumbai Nights", ["Crime", "Drama"], ["Hindi"]), ("Firefly", ["Animation", "Adventure"], ["English"]),
    ("Second Chance", ["Romance", "Comedy"], ["Kannada"]), ("Summit", ["Adventure", "Thriller"], ["English"]),
    ("The Archivist", ["Mystery", "Thriller"], ["English"]), ("Riverstone", ["Drama", "Family"], ["Bengali"]),
    ("Zero Gravity", ["Science Fiction", "Action"], ["English"]), ("A Thousand Miles", ["Drama", "Adventure"], ["Hindi"]),
    ("The Last Match", ["Sports", "Drama"], ["Hindi"]), ("Sunset Radio", ["Music", "Romance"], ["English"]),
    ("Night Shift", ["Horror", "Thriller"], ["English"]), ("The Green Room", ["Comedy", "Drama"], ["Tamil"]),
    ("Lost & Found", ["Family", "Comedy"], ["Hindi"]), ("Atlas", ["Adventure", "Science Fiction"], ["English"]),
    ("The Long Way Home", ["Drama", "Family"], ["Marathi"]), ("Crystal Lake", ["Mystery", "Horror"], ["English"]),
    ("Dreamscape", ["Fantasy", "Romance"], ["Hindi"]), ("Final Cut", ["Crime", "Thriller"], ["English"]),
    ("Café Bombay", ["Romance", "Comedy"], ["Hindi"]), ("The Heist", ["Action", "Crime"], ["Telugu"]),
    ("Northern Lights", ["Drama", "Adventure"], ["English"]), ("Homecoming", ["Drama", "Romance"], ["Malayalam"]),
    ("Velocity", ["Action", "Sports"], ["English"]), ("The Storyteller", ["Fantasy", "Drama"], ["Hindi"]),
]

POSTER_COLORS = ["1d4ed8", "7c3aed", "be123c", "047857", "b45309", "0f766e", "be185d", "334155"]

# Replace the initial demo seeds with real films, in the same order as the
# bundled official poster files (public/images/posters/01.webp ... 50.webp).
REAL_MOVIE_TITLES = [
    "Inception", "Interstellar", "The Dark Knight", "Parasite", "Spirited Away", "The Godfather", "Pulp Fiction", "The Shawshank Redemption", "The Lord of the Rings: The Return of the King", "The Matrix",
    "Gladiator", "Whiplash", "Mad Max: Fury Road", "The Grand Budapest Hotel", "La La Land", "Dune", "Everything Everywhere All at Once", "Oppenheimer", "Barbie", "Top Gun: Maverick",
    "The Batman", "Black Panther", "Spider-Man: Into the Spider-Verse", "Avengers: Endgame", "Coco", "Your Name", "The Lion King", "Jurassic Park", "The Silence of the Lambs", "Get Out",
    "Knives Out", "The Social Network", "Arrival", "Blade Runner 2049", "The Prestige", "The Truman Show", "The Departed", "The Wolf of Wall Street", "12 Angry Men", "The Good, the Bad and the Ugly",
    "The Princess Bride", "The Breakfast Club", "Alien", "The Thing", "The Exorcist", "Jaws", "The Shining", "The Green Mile", "The Sixth Sense", "Fight Club",
]
MOVIE_SEEDS = [(title, ["Drama"], ["English"]) for title in REAL_MOVIE_TITLES]

def build_movie(index: int, title: str, genres: List[str], languages: List[str]):
    poster = f"/images/posters/{index + 1:02d}.webp"
    return {
        "id": f"m{index + 1}", "title": title, "tagline": f"A captivating {genres[0].lower()} story.",
        "poster": poster, "backdrop": poster,
        "trailerUrl": "", "synopsis": f"{title} follows an unforgettable journey filled with heart, surprises, and cinematic spectacle.",
        "cast": [], "director": "BookNow Studios", "producer": "BookNow Pictures", "runtimeMinutes": 95 + (index % 5) * 15,
        "genres": genres, "languages": languages, "imdbRating": round(6.8 + (index % 23) / 10, 1), "userRating": 0,
        "totalRatingsCount": 0, "ageRating": "UA", "releaseDate": (date.today() - timedelta(days=index * 14)).isoformat(),
        "screenshots": [], "isNowShowing": True, "isComingSoon": False, "isTrending": index % 3 == 0,
        "isTopRated": index % 4 == 0, "isExclusive": index % 7 == 0, "formats": ["2D", "3D", "IMAX 3D"],
    }

MOVIES = [build_movie(index, title, genres, languages) for index, (title, genres, languages) in enumerate(MOVIE_SEEDS)]
CITIES = [{"id": "mumbai", "name": "Mumbai", "state": "Maharashtra", "popularTheatresCount": 42}]
THEATRES = [
    {"id": "t1", "cityId": "mumbai", "name": "PVR Juhu", "location": "Juhu, Mumbai", "rating": 4.6, "facilities": ["IMAX", "Dolby Atmos", "Parking"]},
    {"id": "t2", "cityId": "mumbai", "name": "INOX R City", "location": "Ghatkopar, Mumbai", "rating": 4.4, "facilities": ["Food Court", "Recliner Seats", "Parking"]},
    {"id": "t3", "cityId": "mumbai", "name": "Cinepolis Andheri", "location": "Andheri West, Mumbai", "rating": 4.5, "facilities": ["Dolby Atmos", "Wheelchair Access"]},
    {"id": "t4", "cityId": "mumbai", "name": "PVR Phoenix", "location": "Lower Parel, Mumbai", "rating": 4.7, "facilities": ["IMAX", "Recliner Seats", "Food Court"]},
]
SHOW_SLOTS = [("10:30", "2D", 180), ("14:15", "3D", 220), ("18:00", "IMAX 3D", 300), ("21:30", "2D", 200)]
SHOWS = [
    {"id": f"s-{movie['id']}-{theatre['id']}-{day_offset}-{slot_index}", "movieId": movie["id"], "theatreId": theatre["id"],
     "screenId": f"{theatre['id']}-sc{slot_index + 1}", "date": (date.today() + timedelta(days=day_offset)).isoformat(),
     "time": show_time, "format": show_format, "language": movie["languages"][0], "priceVIP": base_price + 250,
     "pricePremium": base_price + 100, "priceExecutive": base_price + 40, "priceNormal": base_price, "bookedSeatIds": []}
    for movie in MOVIES for theatre in THEATRES for day_offset in range(7)
    for slot_index, (show_time, show_format, base_price) in enumerate(SHOW_SLOTS)
]

def build_seats(show):
    """Build the auditorium layout for a show from its persisted booked seats."""
    category_by_row = {
        "A": "VIP", "B": "VIP", "C": "Premium", "D": "Premium",
        "E": "Executive", "F": "Executive", "G": "Normal", "H": "Normal",
    }
    price_by_category = {
        "VIP": show["priceVIP"], "Premium": show["pricePremium"],
        "Executive": show["priceExecutive"], "Normal": show["priceNormal"],
    }
    booked_ids = set(show["bookedSeatIds"])
    return [
        {
            "id": f"{row}{number}", "row": row, "number": number,
            "category": category_by_row[row], "price": price_by_category[category_by_row[row]],
            "isBooked": f"{row}{number}" in booked_ids,
        }
        for row in category_by_row for number in range(1, 13)
    ]
FOOD_ITEMS = [
    {"id": "f1", "name": "Classic Popcorn", "description": "Freshly popped salted popcorn", "price": 250, "category": "Popcorn", "image": "/images/food/popcorn.jpg", "isVeg": True, "popular": True},
    {"id": "f2", "name": "Movie Combo", "description": "Popcorn and a chilled drink", "price": 399, "category": "Combos", "image": "/images/food/movie-combo.jpg", "isVeg": True, "popular": True},
    {"id": "f3", "name": "Nachos", "description": "Crisp nachos with cheesy dip", "price": 220, "category": "Snacks", "image": "/images/food/nachos.jpg", "isVeg": True},
    {"id": "f4", "name": "Cold Coffee", "description": "Iced coffee with cream", "price": 180, "category": "Beverages", "image": "/images/food/cold-coffee.jpg", "isVeg": True},
]

store = {
    "moviesList": MOVIES.copy(),
    "reviewsList": [],
    "bookingsList": [],
    "userProfile": {
        "id": "u1", "name": "Vinit Satve", "email": "satvevinit@gmail.com", "phone": "8830292804", "avatar": "",
        "walletBalance": 1000, "rewardPoints": 150, "watchlist": [], "favorites": [], "referralCode": "BOOKNOW100"
    }
}

class ReviewModel(BaseModel):
    rating: int
    comment: str

class ValidateCouponModel(BaseModel):
    code: str

class BookingModel(BaseModel):
    showId: str
    seats: List[Any]
    foodItems: Optional[List[Any]] = []
    paymentMethod: str
    discountAmount: Optional[int] = 0

class TopupModel(BaseModel):
    amount: int

class AiRecommendModel(BaseModel):
    mood: Optional[str] = None
    genrePreference: Optional[str] = None
    language: Optional[str] = None

class AdminMovieModel(BaseModel):
    title: str
    runtimeMinutes: int
    genres: List[str]
    releaseDate: str

@app.get("/api/movies")
def get_movies():
    return {"success": True, "movies": store["moviesList"]}

@app.get("/api/movies/{id}")
def get_movie(id: str):
    movie = next((m for m in store["moviesList"] if m["id"] == id), None)
    if movie:
        reviews = [r for r in store["reviewsList"] if r["movieId"] == id]
        return {"success": True, "movie": movie, "reviews": reviews}
    return {"success": False, "message": "Movie not found"}

@app.post("/api/movies/{id}/reviews")
def add_review(id: str, review: ReviewModel):
    new_review = {
        "id": f"r-{int(time.time()*1000)}",
        "movieId": id,
        "userId": store["userProfile"]["id"],
        "userName": store["userProfile"]["name"],
        "rating": review.rating,
        "comment": review.comment,
        "date": "Just now",
        "helpfulCount": 0
    }
    store["reviewsList"].append(new_review)
    return {"success": True, "review": new_review}

@app.get("/api/cities")
def get_cities():
    return {"success": True, "cities": CITIES}

@app.get("/api/theatres")
def get_theatres(cityId: str = "mumbai", movieId: Optional[str] = None):
    results = [t for t in THEATRES if t["cityId"].lower() == cityId.lower()]
    return {"success": True, "theatres": results}

@app.get("/api/shows")
def get_shows(movieId: str, date: str, theatreId: Optional[str] = None):
    results = [s for s in SHOWS if s["movieId"] == movieId and s["date"] == date]
    if theatreId:
        results = [s for s in results if s["theatreId"] == theatreId]
    return {"success": True, "shows": results}

@app.get("/api/shows/{id}")
def get_show_details(id: str):
    show = next((s for s in SHOWS if s["id"] == id), None)
    if show:
        movie = next((m for m in store["moviesList"] if m["id"] == show["movieId"]), None)
        theatre = next((t for t in THEATRES if t["id"] == show["theatreId"]), None)
        return {"success": True, "show": show, "movie": movie, "theatre": theatre, "seats": build_seats(show)}
    return {"success": False, "message": "Show not found"}

@app.get("/api/food")
def get_food():
    return {"success": True, "foodItems": FOOD_ITEMS}

@app.post("/api/coupons/validate")
def validate_coupon(data: ValidateCouponModel):
    if data.code == "WELCOME50":
        return {"success": True, "discountAmount": 50, "description": "Flat ₹50 off applied"}
    return {"success": False, "message": "Invalid coupon"}

@app.post("/api/bookings")
def create_booking(data: BookingModel):
    show = next((s for s in SHOWS if s["id"] == data.showId), None)
    if not show:
        return {"success": False, "message": "Show not found"}
    
    movie = next((m for m in store["moviesList"] if m["id"] == show["movieId"]), MOVIES[0])
    theatre = next((t for t in THEATRES if t["id"] == show["theatreId"]), THEATRES[0])
    available_seats = {seat["id"]: seat for seat in build_seats(show)}
    seat_ids = [seat.get("id") for seat in data.seats]
    if not seat_ids or any(seat_id not in available_seats or available_seats[seat_id]["isBooked"] for seat_id in seat_ids):
        return {"success": False, "message": "One or more selected seats are no longer available"}
    selected_seats = [available_seats[seat_id] for seat_id in seat_ids]
    ticket_total = sum(seat["price"] for seat in selected_seats)
    food_total = sum(f["price"] * f["quantity"] for f in data.foodItems) if data.foodItems else 0
    convenience_fee = 35
    gst = round((ticket_total + food_total) * 0.18)
    total_paid = max(0, ticket_total + food_total + convenience_fee + gst - data.discountAmount)
    
    if data.paymentMethod == "BookNow Wallet":
        if store["userProfile"]["walletBalance"] < total_paid:
            return {"success": False, "message": "Insufficient balance"}
        store["userProfile"]["walletBalance"] -= total_paid

    earned_points = round(ticket_total * 0.1)
    store["userProfile"]["rewardPoints"] += earned_points
    
    show["bookedSeatIds"].extend(seat_ids)
    new_booking = {
        "id": f"b-{int(time.time()*1000)}",
        "bookingCode": f"CP-{int(time.time()%100000)}",
        "userId": store["userProfile"]["id"],
        "movieTitle": movie["title"], "moviePoster": movie["poster"], "theatreName": theatre["name"],
        "screenName": show["screenId"], "city": "Mumbai", "showDate": show["date"], "showTime": show["time"],
        "format": show["format"], "seats": selected_seats, "foodItems": data.foodItems or [],
        "ticketPriceTotal": ticket_total, "foodPriceTotal": food_total, "convenienceFee": convenience_fee,
        "gst": gst, "discount": data.discountAmount, "bookingDate": date.today().isoformat(),
        "qrData": f"BOOKNOW:{show['id']}:{','.join(seat_ids)}",
        "totalPaid": total_paid,
        "paymentMethod": data.paymentMethod,
        "paymentStatus": "SUCCESS"
    }
    store["bookingsList"].insert(0, new_booking)
    return {"success": True, "booking": new_booking, "earnedPoints": earned_points, "newWalletBalance": store["userProfile"]["walletBalance"]}

@app.get("/api/user")
def get_user():
    return {"success": True, "user": store["userProfile"], "bookings": store["bookingsList"]}

@app.post("/api/user/wallet/topup")
def topup_wallet(data: TopupModel):
    store["userProfile"]["walletBalance"] += data.amount
    return {"success": True, "walletBalance": store["userProfile"]["walletBalance"], "message": "Wallet balance updated"}

@app.post("/api/ai/recommend")
def ai_recommend(data: AiRecommendModel):
    try:
        if not os.getenv("GEMINI_API_KEY") or genai is None:
            raise Exception("No key")
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        prompt = f"Recommend a movie based on mood: {data.mood}, genre: {data.genrePreference}"
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return {"success": True, "aiReasoning": response.text, "recommendedMovieId": MOVIES[0]["id"]}
    except Exception as e:
        return {"success": True, "aiReasoning": f"Based on your {data.mood or 'happy'} mood, try {MOVIES[0]['title']}", "recommendedMovieId": MOVIES[0]["id"]}

@app.get("/api/admin/stats")
def admin_stats():
    bookings = store["bookingsList"]
    totals_by_movie = {}
    for booking in bookings:
        title = booking["movieTitle"]
        if title not in totals_by_movie:
            totals_by_movie[title] = {"title": title, "revenue": 0, "ticketsSold": 0}
        totals_by_movie[title]["revenue"] += booking["totalPaid"]
        totals_by_movie[title]["ticketsSold"] += len(booking["seats"])
    return {"success": True, "stats": {
        "totalRevenue": sum(booking["totalPaid"] for booking in bookings),
        "totalTicketsSold": sum(len(booking["seats"]) for booking in bookings),
        "totalMoviesActive": len(store["moviesList"]),
        "totalTheatres": len(THEATRES),
        "topMovies": sorted(totals_by_movie.values(), key=lambda movie: movie["revenue"], reverse=True),
    }, "recentBookings": bookings[:5]}

@app.post("/api/admin/movies")
def add_admin_movie(movie: AdminMovieModel):
    new_m = build_movie(len(store["moviesList"]), movie.title, movie.genres, movie.languages)
    new_m.update(movie.dict())
    new_m["id"] = f"m-{int(time.time()*1000)}"
    store["moviesList"].insert(0, new_m)
    return {"success": True, "movie": new_m}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
