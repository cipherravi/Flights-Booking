const axios = require("axios");
const { v4 } = require("uuid");
const {
  BookingRepository,
  SeatRepository,
  IdempotencyKeyRepository,
} = require("../repositories");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/AppError");
const { getLogger } = require("../config");
const logger = getLogger(__filename);
const { Booking, sequelize } = require("../models");
const seatRepository = new SeatRepository();
const bookingRepository = new BookingRepository();
const idempotencyKeyRepository = new IdempotencyKeyRepository();
const { ServerConfig } = require("../config");
const { FLIGHT_SERVICE_URL } = ServerConfig;
const { Op } = require("sequelize");

async function createBooking(
  userId,
  flightId,
  seatNumbers,
  airplaneId,
  calculatedPrice
) {
  const transaction = await sequelize.transaction();
  try {
    logger.info("Checking seat availability...");
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
    logger.info("Locking selected seats...");
    await seatRepository.lockSelectedSeat(seatNumbers, airplaneId, transaction);

    logger.info("Creating uuid...");
    const idempotencyKey = v4();
    logger.info("Creating booking entry in DB...");
    const booking = await bookingRepository.create(
      {
        userId,
        airplaneId,
        flightId,
        seats: seatNumbers.join(","),
        totalPrice: calculatedPrice,
        status: "PENDING",
        idempotencyKey: idempotencyKey,
      },
      { transaction }
    );
    logger.info("Updating seat status in DB...");
    await seatRepository.updateSeatStatus(seatNumbers, transaction);
    logger.info("Committing transaction...");
    await transaction.commit();

    logger.info(
      `Calling FLIGHT_SERVICE to update seats. URL: ${FLIGHT_SERVICE_URL}/api/v1/flights`
    );
    logger.info(
      `Payload: ${JSON.stringify({
        id: flightId,
        seats: seatNumbers.length,
        decrease: true,
      })}`
    );

    // updateRemaining seat with API
    const noOfSeats = seatNumbers.length;
    await axios.patch(`${FLIGHT_SERVICE_URL}/api/v1/flights`, {
      id: flightId,
      seats: noOfSeats,
      decrease: true,
    });

    return booking;
  } catch (error) {
    logger.error("Rolling back transaction due to error");
    logger.error("Booking failed:", error.stack || error.message);
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

async function cancelBooking(bookingId, userId) {
  const transaction = await sequelize.transaction();
  try {
    const fetchData = await bookingRepository.get(bookingId);
    if (!fetchData) {
      throw new AppError("No Bookings Found", StatusCodes.BAD_REQUEST);
    }
    const seatNumbers = fetchData.seats.split(",").map((s) => s.trim());
    const noOfSeats = seatNumbers.length;

    if (userId !== fetchData.userId) {
      throw new AppError("User doesn't have booking", StatusCodes.BAD_REQUEST);
    }
    await bookingRepository.destroy({
      id: bookingId,
      userId: userId,
    });

    await seatRepository.bulkUpdate(
      { isBooked: false },
      {
        seatNumber: {
          [Op.in]: seatNumbers,
        },
      },
      transaction
    );
    await transaction.commit();

    // updateRemaining seat with API

    await axios.patch(`${FLIGHT_SERVICE_URL}/api/v1/flights`, {
      id: fetchData.flightId,
      seats: noOfSeats,
      decrease: false,
    });

    return fetchData;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function makePayment(bookingId, userId) {
  const transaction = await sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.get(bookingId);
    const { userId: dbUserId, idempotencyKey } = bookingDetails;

    if (!bookingDetails) {
      throw new AppError(
        "Payment failed , Booking not found",
        StatusCodes.BAD_REQUEST
      );
    }
    const checkPayment = await idempotencyKeyRepository.checkPayment({
      key: { [Op.eq]: idempotencyKey },
    });

    if (checkPayment) {
      await transaction.commit();
      return { Status: "Booking already done" };
    }

    if (userId !== dbUserId) {
      throw new AppError(
        "Payment failed ,Invlaid user",
        StatusCodes.BAD_REQUEST
      );
    }

    // PUT HERE YOUR PAYMENT LOGIC
    const chargeUser = () => {
      return {
        paymentStatus: "OK",
      };
    };

    if (!chargeUser.paymentStatus == "OK") {
      throw new AppError(
        "Payment Failed , please try again ",
        StatusCodes.UNPROCESSABLE_ENTITY
      );
    }
    const response = await bookingRepository.updateBookingStatus(
      { isPaid: true, status: "booked" },
      { userId: userId },
      transaction
    );

    await idempotencyKeyRepository.addKeys(
      { key: idempotencyKey, userId },
      transaction
    );

    await transaction.commit();
    return response;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = { createBooking, cancelBooking, makePayment };
