const express = require("express");
const router = express.Router();

const { SeatController } = require("../../controllers");

router.get("/", SeatController.getAirplaneSeats);
router.patch("/", SeatController.updateAirplaneSeat);
router.post("/generate", SeatController.generateSeats);

module.exports = router;
