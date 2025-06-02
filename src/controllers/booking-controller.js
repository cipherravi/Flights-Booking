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
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    logger.error(error.stack || error.message);
    const statusCode =
      error instanceof AppError
        ? error.statusCode
        : StatusCodes.INTERNAL_SERVER_ERROR;
    const message =
      error instanceof AppError ? error.message : "Something went wrong";
    ErrorResponse.error = error;
    ErrorResponse.message = message;
    return res.status(statusCode).json(ErrorResponse);
  }
}

async function cancelBooking(req, res) {
  const { bookingId, userId } = req.body;
  try {
    const response = await BookingService.cancelBooking(
      bookingId,
      Number(userId)
    );
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully cancelled booking";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    logger.error(error.stack || error.message);
    const statusCode =
      error instanceof AppError
        ? error.statusCode
        : StatusCodes.INTERNAL_SERVER_ERROR;
    const message =
      error instanceof AppError ? error.message : "Something went wrong";
    ErrorResponse.error = error;
    ErrorResponse.message = message;
    return res.status(statusCode).json(ErrorResponse);
  }
}

async function makePayment(req, res) {
  const { bookingId, userId } = req.body;
  try {
    if (!bookingId || !userId) {
      throw new AppError("Provide valid details", StatusCodes.BAD_REQUEST);
    }

    const response = await BookingService.makePayment(
      bookingId,
      Number(userId)
    );
    SuccessResponse.data = response;
    SuccessResponse.message = response.Status || "Successfully Booked Ticket";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    logger.error(error.stack || error.message);
    const statusCode =
      error instanceof AppError
        ? error.statusCode
        : StatusCodes.INTERNAL_SERVER_ERROR;
    const message =
      error instanceof AppError ? error.message : "Something went wrong";
    ErrorResponse.error = error;
    ErrorResponse.message = message;
    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = { createBooking, cancelBooking, makePayment };
