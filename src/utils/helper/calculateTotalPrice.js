const { Seat } = require("../../models");
const { Op } = require("sequelize");

async function calculateTotalPrice(
  basePrice,
  flightId,
  airplaneId,
  seatNumbers
) {
  const seatInfo = await Seat.findAll({
    where: {
      seatNumber: {
        [Op.in]: seatNumbers,
      },
      airplaneId,
    },
  });

  let totalPrice = 0;

  for (const seat of seatInfo) {
    let seatPrice = basePrice;

    // Seat Type Modifier
    if (seat.seatType === "window") {
      seatPrice *= 1.1;
    }

    // Seat Class Modifier
    switch (seat.seatClass) {
      case "first":
        seatPrice *= 2;
        break;
      case "business":
        seatPrice *= 1.5;
        break;
      case "premium economy":
        seatPrice *= 1.3;
        break;
      case "economy":
      default:
        seatPrice *= 1;
    }

    totalPrice += seatPrice;
  }

  return totalPrice;
}

module.exports = calculateTotalPrice;
