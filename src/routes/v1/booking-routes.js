const express = require("express");
const router = express.Router();

const { BookingController } = require("../../controllers");
const { getBookings, createBooking, makePayment, cancelBooking } =
  BookingController;
const { BookingMiddleware } = require("../../middlewares");
const { verifyFlight } = BookingMiddleware;
const verifyUser = require("../../middlewares/verifyUser");

router.get("/", verifyUser, getBookings);
router.post("/", verifyUser, verifyFlight, createBooking);
router.post("/payments", verifyUser, makePayment);
router.delete("/", verifyUser, cancelBooking);

module.exports = router;
