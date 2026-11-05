import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const currentToken = localStorage.getItem("stayfinderToken");

    if (!currentToken) {
      navigate("/login");
      return;
    }

    getBookings(currentToken);
  }, [navigate]);

  async function getBookings(currentToken) {
    try {
      const response = await fetch(
        "http://localhost:5000/api/bookings/my-bookings",
        {
          headers: {
            Authorization: `Bearer ${currentToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("stayfinderToken");
          localStorage.removeItem("stayfinderUser");
          navigate("/login");
          return;
        }

        setError(data.message || "Unable to load bookings");
        return;
      }

      setBookings(data);
    } catch (error) {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(id) {
    const currentToken = localStorage.getItem("stayfinderToken");

    if (!currentToken) {
      navigate("/login");
      return;
    }

    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/${id}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${currentToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("stayfinderToken");
          localStorage.removeItem("stayfinderUser");
          navigate("/login");
          return;
        }

        alert(data.message);
        return;
      }

      alert("Booking cancelled successfully");

      getBookings(currentToken);
    } catch (error) {
      alert("Unable to connect to server");
    }
  }

  if (loading) {
    return <h2>Loading bookings...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div className="my-bookings-page">

      <div className="bookings-heading">

        <h1>My Bookings</h1>

        <p>View and manage your hotel bookings.</p>

        <Link to="/">
          Back to Hotels
        </Link>

      </div>


      {bookings.length === 0 ? (

        <div className="no-bookings">

          <h2>No Bookings Found</h2>

          <p>You haven't booked any hotels yet.</p>

          <button onClick={() => navigate("/")}>
            Explore Hotels
          </button>

        </div>

      ) : (

        <div className="bookings-list">

          {bookings.map((booking) => (

            <div className="booking-card" key={booking.id}>

              <img
                src={
                  booking.hotel_image
                    ? booking.hotel_image.startsWith("http")
                      ? booking.hotel_image
                      : `http://localhost:5000${booking.hotel_image}`
                    : "https://placehold.co/600x400?text=Hotel"
                }
                alt={booking.hotel_title}
              />

              <div className="booking-details">

                <h2>{booking.hotel_title}</h2>

                <p>
                  <strong>Booking ID:</strong> {booking.id}
                </p>

                <p>
                  <strong>Room Type:</strong> {booking.room_type}
                </p>

                <p>
                  <strong>Rooms:</strong> {booking.number_of_rooms}
                </p>

                <p>
                  <strong>Check-in:</strong>{" "}
                  {new Date(booking.check_in).toLocaleDateString("en-IN")}
                </p>

                <p>
                  <strong>Check-out:</strong>{" "}
                  {new Date(booking.check_out).toLocaleDateString("en-IN")}
                </p>

                <p>
                  <strong>Total Price:</strong> ₹
                  {Number(booking.total_price).toLocaleString("en-IN")}
                </p>

                <p>
                  <strong>Status:</strong> {booking.status}
                </p>

                {booking.status === "confirmed" && (

                  <button
                    onClick={() => cancelBooking(booking.id)}
                  >
                    Cancel Booking
                  </button>

                )}

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default MyBookings;