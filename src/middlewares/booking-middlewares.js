const axios = require("axios");
const { StatusCodes } = require("http-status-codes");
const { ErrorResponse } = require("../utils/common");
const AppError = require("../utils/AppError");
const { getLogger } = require("../config");
const logger = getLogger(__filename);
const { serverConfig } = require("../config");
const { FLIGHT_SERVICE_URL } = serverConfig;

async function verifyFlight(req, res, next) {
  try {
    const { flightId } = req.body;

    const flight = await axios.get(
      `${FLIGHT_SERVICE_URL}/api/v1/flights/${flightId}`
    );

    req.flight = flight.data;

    next();
  } catch (error) {
    logger.error(error.stack || error.message);
    // Axios error handling
    if (error.response && error.response.status === 404) {
      // Customize your 404 error
      const appError = new AppError("Flight not found", StatusCodes.NOT_FOUND);
      return res.status(appError.statusCode).json({
        success: false,
        message: appError.message,
        error: appError,
      });
    }

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

module.exports = { verifyFlight };
