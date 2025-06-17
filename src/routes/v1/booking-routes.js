const express = require("express");
const router = express.Router();

const { BookingController } = require("../../controllers");
const { getBookings, createBooking, makePayment, cancelBooking } =
  BookingController;
const { BookingMiddleware } = require("../../middlewares");
const { verifyFlight } = BookingMiddleware;

router.get("/", getBookings);
router.post("/", verifyFlight, createBooking);
router.post("/payments", makePayment);
router.delete("/", cancelBooking);

module.exports = router;
