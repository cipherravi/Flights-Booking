const { BookingRepository, SeatRepository } = require("../repositories");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/AppError");
const { getLogger } = require("../config");
const logger = getLogger(__filename);
const { Booking, sequelize } = require("../models");
const seatRepository = new SeatRepository();
const bookingRepository = new BookingRepository();

async function createBooking(
  userId,
  flightId,
  seatNumbers,
  airplaneId,
  calculatedPrice
) {
  const transaction = await sequelize.transaction();
  try {
    //check if seat is available
    const checkSeatAvailability = await seatRepository.checkSeatAvailability(
      seatNumbers,
      airplaneId
    );

    if (!checkSeatAvailability) {
      throw new AppError(
        "Selected seats are not available",
        StatusCodes.BAD_REQUEST
      );
    }
    // return checkSeatAvailability;
    // lock  the seat
    await seatRepository.lockSelectedSeat(seatNumbers, airplaneId, transaction);

    // book seat and generate response
    const booking = await bookingRepository.create(
      {
        userId,
        airplaneId,
        flightId,
        seats: seatNumbers.join(","),
        totalPrice: calculatedPrice,
        status: "PENDING",
      },
      { transaction }
    );

    // set isBooked = true
    await seatRepository.updateSeatStatus(seatNumbers, transaction);

    // COMMIT
    await transaction.commit();

    // updateRemaining seat with API
    const noOfSeats = seatNumbers.length;
    const updateRemainingSeat = () => {};

    return booking;
  } catch (error) {
    await transaction.rollback();
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.forEach((err) => {
        explanation.push(err.message);
      });
      logger.error(explanation);
      throw new AppError(explanation, StatusCodes.BAD_REQUEST);
    }

    logger.error(error.message);
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Cannot create Booking object",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

module.exports = { createBooking };
