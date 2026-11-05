import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";

const API = "http://localhost:5000/api/hotels";
const SERVER = "http://localhost:5000";

function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState("");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomType, setRoomType] = useState("single");
  const [numberOfRooms, setNumberOfRooms] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    async function getHotel() {
      try {
        const response = await axios.get(`${API}/${id}`);
        setHotel(response.data);
      } catch (error) {
        alert("Unable to load hotel details.");
      } finally {
        setLoading(false);
      }
    }

    getHotel();
  }, [id]);

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setUserLocation(`${latitude}, ${longitude}`);
      },
      () => {
        alert("Unable to get your current location. Please allow location access.");
      }
    );
  }

  function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function calculateNights() {
    if (!checkIn || !checkOut) {
      return 0;
    }

    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);

    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  }

  const nights = calculateNights();

  const totalPrice = hotel
    ? Number(hotel.price) * nights * Number(numberOfRooms)
    : 0;

  async function handleBooking(e) {
    e.preventDefault();

    const token = localStorage.getItem("stayfinderToken");

    if (!token) {
      alert("Please login before booking.");
      navigate("/login");
      return;
    }

    if (nights <= 0) {
      alert("Please select a valid check-in and check-out date.");
      return;
    }

    setBookingLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/bookings",
        {
          hotel_id: Number(id),
          room_type: roomType,
          number_of_rooms: Number(numberOfRooms),
          check_in: checkIn,
          check_out: checkOut,
          total_price: totalPrice
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(response.data.message || "Booking successful!");

      setCheckIn("");
      setCheckOut("");
      setNumberOfRooms(1);
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Unable to complete booking."
      );
    } finally {
      setBookingLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="details-page">
        <div className="details-loading">
          Loading hotel details...
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="details-page">
        <h2>Hotel not found</h2>

        <button
          className="back-btn"
          onClick={() => navigate("/")}
        >
          Back to Hotels
        </button>
      </div>
    );
  }

  const image = hotel.image
    ? hotel.image.startsWith("http")
      ? hotel.image
      : `${SERVER}${hotel.image.startsWith("/")
        ? hotel.image
        : `/${hotel.image}`}`
    : "https://placehold.co/1200x700?text=Hotel+Image";

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${Number(hotel.longitude) - 0.02}%2C${Number(hotel.latitude) - 0.02}%2C${Number(hotel.longitude) + 0.02}%2C${Number(hotel.latitude) + 0.02}&layer=mapnik&marker=${hotel.latitude}%2C${hotel.longitude}`;

  return (
    <div className="details-page">
      <Helmet>
        <title>{hotel.title} | namla_stay</title>
        <meta
          name="description"
          content={hotel.description}
        />
      </Helmet>

      <button
        className="back-btn"
        onClick={() => navigate("/")}
      >
        ← Back to Hotels
      </button>

      <div className="details-content">
        <div className="details-image-container">
          <img
            src={image}
            alt={hotel.title}
            className="details-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/1200x700?text=Image+Not+Available";
            }}
          />
        </div>

        <div className="details-info">
          <p className="eyebrow">HOTEL DETAILS</p>

          <h1>{hotel.title}</h1>

          <p className="hotel-description">
            {hotel.description}
          </p>

          <div className="details-price">
            <h2>
              ₹{Number(hotel.price).toLocaleString("en-IN")}
            </h2>
            <span>per night</span>
          </div>

          <div className="coordinates">
            <p>
              <strong>Latitude:</strong> {hotel.latitude}
            </p>
            <p>
              <strong>Longitude:</strong> {hotel.longitude}
            </p>
          </div>
        </div>
      </div>

      <div className="booking-section">
        <div className="booking-heading">
          <h2>Book Your Stay</h2>
          <p>Choose your dates and room details.</p>
        </div>

        <form onSubmit={handleBooking}>
          <div className="booking-field">
            <label>Check-in Date</label>
            <input
              type="date"
              value={checkIn}
              min={getTodayDate()}
              onChange={(e) => {
                setCheckIn(e.target.value);
                setCheckOut("");
              }}
              required
            />
          </div>

          <div className="booking-field">
            <label>Check-out Date</label>
            <input
              type="date"
              value={checkOut}
              min={checkIn
                ? (() => {
                    const date = new Date(`${checkIn}T12:00:00`);
                    date.setDate(date.getDate() + 1);

                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");

                    return `${year}-${month}-${day}`;
                  })()
                : getTodayDate()}
              onChange={(e) => setCheckOut(e.target.value)}
              required
            />
          </div>

          <div className="booking-field">
            <label>Room Type</label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
            >
              <option value="single">Single Bed</option>
              <option value="double">Double Bed</option>
            </select>
          </div>

          <div className="booking-field">
            <label>Number of Rooms</label>
            <input
              type="number"
              min="1"
              max="10"
              value={numberOfRooms}
              onChange={(e) => setNumberOfRooms(e.target.value)}
              required
            />
          </div>

          <div className="booking-total">
            <div className="booking-price-row">
              <span>Price per night</span>
              <strong>
                ₹{Number(hotel.price).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="booking-price-row">
              <span>Total nights</span>
              <strong>{nights}</strong>
            </div>

            <div className="booking-price-row">
              <span>Number of rooms</span>
              <strong>{numberOfRooms}</strong>
            </div>

            <div className="booking-final-price">
              <span>Total Amount</span>
              <h3>₹{totalPrice.toLocaleString("en-IN")}</h3>
            </div>
          </div>

          <button
            type="submit"
            className="confirm-booking-btn"
            disabled={bookingLoading}
          >
            {bookingLoading ? "Booking..." : "Confirm Booking"}
          </button>
        </form>

        <p className="booking-note">
          Demo booking only. No online payment required.
        </p>
      </div>

      <div className="map-section">
        <h2>Hotel Location</h2>
        <p>Explore the hotel location using the map below.</p>

        <iframe
          title="Hotel Location Map"
          src={mapUrl}
          loading="lazy"
          allowFullScreen
        />

        <button
          className="location-btn"
          onClick={getCurrentLocation}
        >
          Get My Current Location
        </button>

        {userLocation && (
          <p className="user-location">
            Your Current Location: {userLocation}
          </p>
        )}
      </div>
    </div>
  );
}

export default HotelDetails;
