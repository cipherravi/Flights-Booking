const express = require("express");
const router = express.Router();

const { SeatController } = require("../../controllers");

router.get("/", SeatController.getAirplaneSeats);
router.patch("/", SeatController.updateAirplaneSeat);

module.exports = router;
