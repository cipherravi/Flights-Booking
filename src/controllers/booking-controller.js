const { BookingService } = require("../services");
const { StatusCodes } = require("http-status-codes");
const { getLogger } = require("../config");
const AppError = require("../utils/AppError");
const logger = getLogger(__filename);
const { SuccessResponse, ErrorResponse } = require("../utils/common");
const calculateTotalPrice = require("../utils/helper/calculateTotalPrice");

async function createBooking(req, res) {
  const { flightId, seatNumber: rawSeatString, airplaneId } = req.body;
  const { price } = req.flight;

  const seatNumbers = rawSeatString.split(",").map((s) => s.trim());
  const calculatedPrice = await calculateTotalPrice(
    price,
    flightId,
    airplaneId,
    seatNumbers
  );

  try {
    const response = await BookingService.createBooking(
      req.user.id,
      req.user.email,
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
  const { bookingId } = req.body;
  try {
    const response = await BookingService.cancelBooking(
      bookingId,
      Number(req.user.id)
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
  const { bookingId } = req.body;
  try {
    if (!bookingId) {
      throw new AppError("Provide valid details", StatusCodes.BAD_REQUEST);
    }

    const response = await BookingService.makePayment(
      bookingId,
      Number(req.user.id)
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
      error instanceof AppError
        ? error.message
        : "Something went wrong while making payment";
    ErrorResponse.error = error;
    ErrorResponse.message = message;
    return res.status(statusCode).json(ErrorResponse);
  }
}

async function getBookings(req, res) {
  try {
    const { id: userId } = req.user;
    console.log(userId);
    if (!userId) {
      throw new AppError("userId Missing", StatusCodes.BAD_REQUEST);
    }
    const response = await BookingService.getBookings(userId);
    if (!response) {
      throw new AppError("No bookings found", StatusCodes.NOT_FOUND);
    }
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched all bookings";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    logger.error(error.stack || error.message);
    const statusCode =
      error instanceof AppError
        ? error.statusCode
        : StatusCodes.INTERNAL_SERVER_ERROR;
    const message =
      error instanceof AppError
        ? error.message
        : "Something went wrong while fetching bookings";
    ErrorResponse.error = error;
    ErrorResponse.message = message;
    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = { createBooking, cancelBooking, makePayment, getBookings };
