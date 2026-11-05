const express = require("express");
const router = express.Router();
const pool = require("./db");
const { verifyToken } = require("./middleware");

// Create a booking
router.post("/", verifyToken, async (req, res) => {
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

    if (
      !Number.isInteger(Number(number_of_rooms)) ||
      Number(number_of_rooms) < 1
    ) {
      return res.status(400).json({
        message: "Enter a valid number of rooms"
      });
    }

    const startDate = new Date(check_in);
    const endDate = new Date(check_out);

    if (
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime()) ||
      endDate <= startDate
    ) {
      return res.status(400).json({
        message: "Please select valid check-in and check-out dates"
      });
    }

    const hotelResult = await pool.query(
      "SELECT id, price FROM hotels WHERE id = $1",
      [hotel_id]
    );

    if (hotelResult.rows.length === 0) {
      return res.status(404).json({
        message: "Hotel not found"
      });
    }

    const start = Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate()
    );

    const end = Date.UTC(
      endDate.getUTCFullYear(),
      endDate.getUTCMonth(),
      endDate.getUTCDate()
    );

    const nights = (end - start) / (1000 * 60 * 60 * 24);
    const totalPrice =
      Number(hotelResult.rows[0].price) *
      nights *
      Number(number_of_rooms);

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
        number_of_rooms,
        check_in,
        check_out,
        totalPrice
      ]
    );

    res.status(201).json({
      message: "Booking successful!",
      booking: result.rows[0]
    });

  } catch (error) {
    console.error("Booking error:", error);

    res.status(500).json({
      message: "Unable to complete booking"
    });
  }
});

module.exports = router;