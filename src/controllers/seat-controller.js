const { SeatService } = require("../services");
const { StatusCodes } = require("http-status-codes");
const { getLogger } = require("../config");
const AppError = require("../utils/AppError");
const logger = getLogger(__filename);
const { SuccessResponse, ErrorResponse } = require("../utils/common");

async function getAirplaneSeats(req, res) {
  const { airplaneId } = req.query;
  if (!airplaneId) {
    throw new AppError("Provide valid airplaneId", StatusCodes.BAD_REQUEST);
  }
  try {
    const seats = await SeatService.getAirplaneSeats(airplaneId);
    SuccessResponse.data = seats;
    SuccessResponse.message = `Successfully fetched seats with airplaneId :${airplaneId}`;
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

async function updateAirplaneSeat(req, res) {
  const { airplaneId, row, number, seatClass, seatType, isBooked } = req.body;

  if (!airplaneId || !row || number === undefined) {
    throw new AppError(
      "airplaneId, row and number are required to update a seat",
      StatusCodes.BAD_REQUEST
    );
  }

  const updates = {
    ...(seatClass !== undefined && { seatClass }),
    ...(seatType !== undefined && { seatType }),
    ...(isBooked !== undefined && { isBooked }),
  };

  try {
    const response = await SeatService.updateAirplaneSeat(
      airplaneId,
      row,
      number,
      updates
    );
    if (!response) {
      throw new AppError(
        `Failed to update seat : ${row}${number}`,
        StatusCodes.NOT_FOUND
      );
    }
    logger.info("Successfully updated seat : ", row, number);
    SuccessResponse.data = response;
    SuccessResponse.message = `Successfully update seat ${row}${number}`;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    logger.error(error.stack || error.message);

    //If it's an AppError then use it's own message status codes
    const statusCode =
      error instanceof AppError
        ? error.statusCode
        : StatusCodes.INTERNAL_SERVER_ERROR;
    const message =
      error instanceof AppError ? error.message : "Something went wrong";

    ErrorResponse.error = message;
    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = { getAirplaneSeats, updateAirplaneSeat };
