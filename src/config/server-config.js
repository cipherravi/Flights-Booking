const path = require("path");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
}

module.exports = {
  PORT: process.env.PORT,
  FLIGHT_SERVICE_URL: process.env.FLIGHT_SERVICE_URL,
  INTERNAL_FLIGHT_SERVICE_TOKEN: process.env.INTERNAL_FLIGHT_SERVICE_TOKEN,
  SECRET_KEY: process.env.SECRET_KEY,
};
