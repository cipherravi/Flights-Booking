const express = require("express");
const router = express.Router();
const { infoController } = require("../../controllers");

const seatRoutes = require("./seat-routes");
const bookingRoutes = require("./booking-routes");

router.use("/info", infoController);
router.use("/seats", seatRoutes);
router.use("/bookings", bookingRoutes);

module.exports = router;
