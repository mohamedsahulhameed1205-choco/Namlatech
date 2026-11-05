import { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchHotels,
  addHotel,
  updateHotel,
  deleteHotel
} from "./redux/hotelSlice";

import HotelDetails from "./HotelDetails";
import Register from "./Register";
import Login from "./Login";
import MyBookings from "./MyBookings";

import "./style.css";


function HotelList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { hotels, loading, error } = useSelector(
    (state) => state.hotels
  );

  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("default");

  const [page, setPage] = useState(1);
  const hotelsPerPage = 6;

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    latitude: "",
    longitude: "",
    price: "",
    image: null
  });

  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("stayfinderUser") || "null"
    );
  } catch (error) {
    user = null;
  }


  useEffect(() => {
    dispatch(fetchHotels());
  }, [dispatch]);


  function handleLogout() {
    localStorage.removeItem("stayfinderToken");
    localStorage.removeItem("stayfinderUser");

    alert("Logged out successfully");
    navigate("/login");
  }


  function handleFormChange(e) {
    const { name, value, files } = e.target;

    if (name === "image") {
      setForm({
        ...form,
        image: files[0]
      });
    } else {
      setForm({
        ...form,
        [name]: value
      });
    }
  }


  function openAddForm() {
    setEditId(null);

    setForm({
      title: "",
      description: "",
      latitude: "",
      longitude: "",
      price: "",
      image: null
    });

    setShowForm(true);
  }


  function openEditForm(hotel) {
    setEditId(hotel.id);

    setForm({
      title: hotel.title,
      description: hotel.description,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      price: hotel.price,
      image: null
    });

    setShowForm(true);
  }


  function closeForm() {
    setShowForm(false);
    setEditId(null);
  }


  async function handleSubmit(e) {
    e.preventDefault();

    if (saving) {
      return;
    }

    setSaving(true);

    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("latitude", form.latitude);
    formData.append("longitude", form.longitude);
    formData.append("price", form.price);

    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      let result;

      if (editId) {
        result = await dispatch(
          updateHotel({
            id: editId,
            formData
          })
        );
      } else {
        result = await dispatch(addHotel(formData));
      }

      if (
        updateHotel.fulfilled.match(result) ||
        addHotel.fulfilled.match(result)
      ) {
        alert(
          editId
            ? "Hotel updated successfully!"
            : "Hotel added successfully!"
        );

        closeForm();

        setForm({
          title: "",
          description: "",
          latitude: "",
          longitude: "",
          price: "",
          image: null
        });

        setPage(1);

        dispatch(fetchHotels());
      } else {
        alert(result.payload || "Unable to save hotel");
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }


  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this hotel?"
    );

    if (!confirmDelete) {
      return;
    }

    const result = await dispatch(deleteHotel(id));

    if (deleteHotel.fulfilled.match(result)) {
      alert("Hotel deleted successfully!");

      dispatch(fetchHotels());
    } else {
      alert(result.payload || "Unable to delete hotel");
    }
  }


  // Search and price filter
  let filteredHotels = hotels || [];

  filteredHotels = filteredHotels.filter((hotel) => {
    const matchesSearch = hotel.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesMin =
      minPrice === "" ||
      Number(hotel.price) >= Number(minPrice);

    const matchesMax =
      maxPrice === "" ||
      Number(hotel.price) <= Number(maxPrice);

    return matchesSearch && matchesMin && matchesMax;
  });


  // Sorting
  if (sort === "low") {
    filteredHotels = [...filteredHotels].sort(
      (a, b) => Number(a.price) - Number(b.price)
    );
  }

  if (sort === "high") {
    filteredHotels = [...filteredHotels].sort(
      (a, b) => Number(b.price) - Number(a.price)
    );
  }


  // Pagination
  const totalPages = Math.ceil(
    filteredHotels.length / hotelsPerPage
  );

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }

    if (totalPages === 0 && page !== 1) {
      setPage(1);
    }
  }, [page, totalPages]);


  const startIndex = (page - 1) * hotelsPerPage;

  const currentHotels = filteredHotels.slice(
    startIndex,
    startIndex + hotelsPerPage
  );


  return (
    <div className="app-container">

      {/* Navbar */}
      <header className="navbar">

        <Link to="/" className="logo">
          Namla_Stays
        </Link>

        <div className="nav-links">

          {user ? (
            <>
              <span>Welcome, {user.name}</span>

              {user.role === "user" && (
                <Link to="/my-bookings">
                  My Bookings
                </Link>
              )}

              {user.role === "admin" && (
                <button
                  type="button"
                  onClick={openAddForm}
                >
                  Add Hotel
                </button>
              )}

              <button
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}

        </div>

      </header>


      {/* Hero Section */}
      <section className="hero-section">

        <h1>Book Your Dream Stay </h1>

        <p>
         Discover the best hotels, compare your options, and book your comfortable stay with ease.
        </p>

      </section>


      {/* Search and Filters */}
      <section className="filter-section">

        <input
          type="text"
          placeholder="Search hotels..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <input
          type="number"
          placeholder="Minimum Price"
          value={minPrice}
          onChange={(e) => {
            setMinPrice(e.target.value);
            setPage(1);
          }}
        />

        <input
          type="number"
          placeholder="Maximum Price"
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(e.target.value);
            setPage(1);
          }}
        />

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
        >
          <option value="default">Sort By</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>

      </section>


      {/* Loading and Error */}
      {loading && <p>Loading hotels...</p>}

      {error && <p>{error}</p>}


      {/* Hotel List */}
      <section className="hotel-list">

        {currentHotels.length > 0 ? (

          currentHotels.map((hotel) => (

            <div className="hotel-card" key={hotel.id}>

              <img
                src={
                  hotel.image
                    ? hotel.image.startsWith("http")
                      ? hotel.image
                      : `http://localhost:5000${hotel.image.startsWith("/")
                        ? hotel.image
                        : `/${hotel.image}`}`
                    : "https://placehold.co/600x400?text=Hotel"
                }
                alt={hotel.title}
              />

              <div className="hotel-info">

                <h2>{hotel.title}</h2>

                <p>
                  {hotel.description.length > 100
                    ? hotel.description.substring(0, 100) + "..."
                    : hotel.description}
                </p>

                <h3>₹{hotel.price} / night</h3>

                <Link
                  to={`/hotel/${hotel.id}`}
                  className="view-button"
                >
                  View Details
                </Link>

                {user?.role === "admin" && (

                  <div className="admin-buttons">

                    <button
                      type="button"
                      onClick={() => openEditForm(hotel)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(hotel.id)}
                    >
                      Delete
                    </button>

                  </div>

                )}

              </div>

            </div>

          ))

        ) : (

          !loading && <p>No hotels found.</p>

        )}

      </section>


      {/* Pagination */}
      {totalPages > 1 && (

        <div className="pagination">

          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((pageNumber) => (

            <button
              type="button"
              key={pageNumber}
              className={page === pageNumber ? "active" : ""}
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </button>

          ))}

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>

        </div>

      )}


      {/* Add and Edit Hotel Form */}
      {showForm && (

        <div className="modal">

          <div className="modal-content">

            <h2>
              {editId ? "Edit Hotel" : "Add New Hotel"}
            </h2>

            <form onSubmit={handleSubmit}>

              <label>Hotel Name</label>

              <input
                type="text"
                name="title"
                placeholder="Enter hotel name"
                value={form.title}
                onChange={handleFormChange}
                required
              />


              <label>Description</label>

              <textarea
                name="description"
                placeholder="Enter hotel description"
                value={form.description}
                onChange={handleFormChange}
                required
              />


              <label>Latitude</label>

              <input
                type="number"
                step="any"
                name="latitude"
                placeholder="Enter latitude"
                value={form.latitude}
                onChange={handleFormChange}
                required
              />


              <label>Longitude</label>

              <input
                type="number"
                step="any"
                name="longitude"
                placeholder="Enter longitude"
                value={form.longitude}
                onChange={handleFormChange}
                required
              />


              <label>Price Per Night</label>

              <input
                type="number"
                name="price"
                placeholder="Enter price"
                value={form.price}
                onChange={handleFormChange}
                required
              />


              <label>Hotel Image</label>

              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleFormChange}
                required={!editId}
              />


              <button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Please wait..."
                  : editId
                    ? "Update Hotel"
                    : "Add Hotel"}
              </button>


              <button
                type="button"
                onClick={closeForm}
              >
                Cancel
              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


function App() {
  return (
    <Routes>

      <Route path="/" element={<HotelList />} />

      <Route path="/hotel/:id" element={<HotelDetails />} />

      <Route path="/register" element={<Register />} />

      <Route path="/login" element={<Login />} />

      <Route path="/my-bookings" element={<MyBookings />} />

    </Routes>
  );
}


export default App;