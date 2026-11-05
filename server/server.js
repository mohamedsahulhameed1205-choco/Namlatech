const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const pool = require("./db");
const authRoutes = require("./auth");
const { verifyToken, adminOnly } = require("./middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);

// Image upload settings
const uploadFolder = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    const fileName = Date.now() + path.extname(file.originalname);
    cb(null, fileName);
  }
});

const upload = multer({ storage: storage });


// Get all hotels
app.get("/api/hotels", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM hotels ORDER BY id DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to get hotels" });
  }
});


// Get single hotel
app.get("/api/hotels/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM hotels WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to get hotel details" });
  }
});


// Add hotel - Admin only
app.post(
  "/api/hotels",
  verifyToken,
  adminOnly,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        latitude,
        longitude,
        price
      } = req.body;

      if (!title || !description || !latitude || !longitude || !price) {
        return res.status(400).json({
          message: "Please fill all hotel details"
        });
      }

      const image = req.file ? `/uploads/${req.file.filename}` : null;

      const result = await pool.query(
        `INSERT INTO hotels
        (image, title, description, latitude, longitude, price)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [image, title, description, latitude, longitude, price]
      );

      res.status(201).json({
        message: "Hotel added successfully",
        hotel: result.rows[0]
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to add hotel" });
    }
  }
);


// Update hotel - Admin only
app.put(
  "/api/hotels/:id",
  verifyToken,
  adminOnly,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        latitude,
        longitude,
        price
      } = req.body;

      const oldHotel = await pool.query(
        "SELECT * FROM hotels WHERE id = $1",
        [req.params.id]
      );

      if (oldHotel.rows.length === 0) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      const image = req.file
        ? `/uploads/${req.file.filename}`
        : oldHotel.rows[0].image;

      const result = await pool.query(
        `UPDATE hotels
        SET image = $1,
            title = $2,
            description = $3,
            latitude = $4,
            longitude = $5,
            price = $6
        WHERE id = $7
        RETURNING *`,
        [
          image,
          title,
          description,
          latitude,
          longitude,
          price,
          req.params.id
        ]
      );

      res.json({
        message: "Hotel updated successfully",
        hotel: result.rows[0]
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to update hotel" });
    }
  }
);

// Delete hotel - Admin only
app.delete(
  "/api/hotels/:id",
  verifyToken,
  adminOnly,
  async (req, res) => {
    try {
      const hotelId = req.params.id;

      // Check whether this hotel has bookings
      const bookingResult = await pool.query(
        "SELECT id FROM bookings WHERE hotel_id = $1 LIMIT 1",
        [hotelId]
      );

      if (bookingResult.rows.length > 0) {
        return res.status(400).json({
          message: "This hotel cannot be deleted because it has existing bookings."
        });
      }

      // Delete hotel
      const result = await pool.query(
        "DELETE FROM hotels WHERE id = $1 RETURNING *",
        [hotelId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Hotel not found"
        });
      }

      res.json({
        message: "Hotel deleted successfully"
      });

    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Unable to delete hotel"
      });
    }
  }
);



// Create booking - Logged-in users only
app.post("/api/bookings", verifyToken, async (req, res) => {
  try {
    const {
      hotel_id,
      room_type,
      number_of_rooms,
      check_in,
      check_out
    } = req.body;

    if (
      !hotel_id ||
      !room_type ||
      !number_of_rooms ||
      !check_in ||
      !check_out
    ) {
      return res.status(400).json({
        message: "Please fill all booking details"
      });
    }

    if (!["single", "double"].includes(room_type)) {
      return res.status(400).json({
        message: "Invalid room type"
      });
    }

    const rooms = Number(number_of_rooms);

    if (!Number.isInteger(rooms) || rooms < 1 || rooms > 10) {
      return res.status(400).json({
        message: "Choose between 1 and 10 rooms"
      });
    }

    const startDate = new Date(`${check_in}T00:00:00Z`);
    const endDate = new Date(`${check_out}T00:00:00Z`);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate <= startDate
    ) {
      return res.status(400).json({
        message: "Check-out date must be after check-in date"
      });
    }

    const nights = Math.round(
      (endDate - startDate) / (1000 * 60 * 60 * 24)
    );

    const hotelResult = await pool.query(
      "SELECT * FROM hotels WHERE id = $1",
      [hotel_id]
    );

    if (hotelResult.rows.length === 0) {
      return res.status(404).json({
        message: "Hotel not found"
      });
    }

    const hotel = hotelResult.rows[0];

    const totalPrice =
      Number(hotel.price) * nights * rooms;

    const result = await pool.query(
      `INSERT INTO bookings
      (user_id, hotel_id, room_type, number_of_rooms,
       check_in, check_out, total_price)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        req.user.id,
        hotel_id,
        room_type,
        rooms,
        check_in,
        check_out,
        totalPrice
      ]
    );

    res.status(201).json({
      message: "Booking successful",
      booking: result.rows[0]
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Unable to create booking"
    });
  }
});


// Get logged-in user's bookings
app.get("/api/bookings/my-bookings", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        bookings.*,
        hotels.title AS hotel_title,
        hotels.image AS hotel_image,
        hotels.price AS hotel_price
      FROM bookings
      INNER JOIN hotels ON bookings.hotel_id = hotels.id
      WHERE bookings.user_id = $1
      ORDER BY bookings.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Unable to get your bookings"
    });
  }
});


// Cancel booking
app.patch(
  "/api/bookings/:id/cancel",
  verifyToken,
  async (req, res) => {
    try {
      const result = await pool.query(
        `UPDATE bookings
        SET status = 'cancelled'
        WHERE id = $1
        AND user_id = $2
        AND status = 'confirmed'
        RETURNING *`,
        [req.params.id, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Booking not found or already cancelled"
        });
      }

      res.json({
        message: "Booking cancelled successfully",
        booking: result.rows[0]
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Unable to cancel booking"
      });
    }
  }
);


// Error handling
app.use((error, req, res, next) => {
  console.log(error);

  res.status(500).json({
    message: "Something went wrong"
  });
});


// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`StayFinder server running on port ${PORT}`);
});