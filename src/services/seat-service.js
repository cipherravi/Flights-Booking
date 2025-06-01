const { SeatRepository } = require("../repositories");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/AppError");
const { getLogger } = require("../config");
const logger = getLogger(__filename);
const seatRepository = new SeatRepository();

async function getAirplaneSeats(airplaneId) {
  try {
    const seats = await seatRepository.getAirplaneSeats(airplaneId);
    if (!seats) {
      throw new AppError("Something went wrong", StatusCodes.BAD_REQUEST);
    }
    return seats;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      "Cannot fetch all seats",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function updateAirplaneSeat(airplaneId, row, number, updates) {
  try {
    const seat = await seatRepository.updateSeat(
      airplaneId,
      row,
      number,
      updates
    );

    if (!seat) {
      throw new AppError(
        `Seat not found for Airplane ${airplaneId} at ${row}${number}`,
        StatusCodes.NOT_FOUND
      );
    }
    logger.info("Successfully update airplane seat : ", row, number);
    return seat;
  } catch (error) {
    if (
      error.name == "SequelizeValidationError" ||
      error.name == "SequelizeUniqueConstraintError"
    ) {
      let explanation = [];
      error.errors.forEach((err) => {
        explanation.push(err.message);
      });
      logger.error(explanation);
      throw new AppError(explanation, StatusCodes.BAD_REQUEST);
    }
    logger.error(error.message);

    throw new AppError(
      "Cannot Update Airplane Seat",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

module.exports = { getAirplaneSeats, updateAirplaneSeat };
