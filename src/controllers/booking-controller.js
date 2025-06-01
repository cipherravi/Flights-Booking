const { BookingService } = require("../services");
const { StatusCodes } = require("http-status-codes");
const { getLogger } = require("../config");
const AppError = require("../utils/AppError");
const logger = getLogger(__filename);
const { SuccessResponse, ErrorResponse } = require("../utils/common");

async function createBooking(req, res) {
  const {
    userId,
    flightId,
    seatNumber: rawSeatString,
    airplaneId,
    totalPrice,
  } = req.body;

  const seatNumbers = rawSeatString.split(",").map((s) => s.trim());
  const numberOfSeats = seatNumbers.length;
  const calculatedPrice = totalPrice * numberOfSeats;

  try {
    const response = await BookingService.createBooking(
      userId,
      flightId,
      seatNumbers,
      airplaneId,
      calculatedPrice
    );
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully created Booking";
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    ErrorResponse.message = "something went wrong";
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

module.exports = { createBooking };
