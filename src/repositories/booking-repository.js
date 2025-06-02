const { StatusCodes } = require("http-status-codes");
const { Booking, sequelize } = require("../models");
const CrudRepository = require("./crud-repository");

class BookingRepository extends CrudRepository {
  constructor() {
    super(Booking);
  }

  async updateBookingStatus(data, condition, transaction) {
    return await Booking.update(data, { where: condition }, transaction);
  }
}
module.exports = BookingRepository;
