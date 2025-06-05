const path = require("path");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
}
console.log(FLIGHT_SERVICE_URL);
module.exports = {
  PORT: process.env.PORT,
  FLIGHT_SERVICE_URL: process.env.FLIGHT_SERVICE_URL,
};
