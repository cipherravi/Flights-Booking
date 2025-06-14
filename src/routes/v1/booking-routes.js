const express = require("express");
const router = express.Router();

const { BookingController } = require("../../controllers");
const { getBookings, createBooking, makePayment, cancelBooking } =
  BookingController;

router.get("/", getBookings);
router.post("/", createBooking);
router.post("/payments", makePayment);
router.delete("/", cancelBooking);

module.exports = router;
