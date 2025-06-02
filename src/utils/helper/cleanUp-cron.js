const { getLogger } = require("../../config");
const logger = getLogger(__filename);
const { BookingRepository, SeatRepository } = require("../../repositories");
const { sequelize } = require("../../models");
const { Op } = require("sequelize");

const bookingRepository = new BookingRepository();
const seatRepository = new SeatRepository();

function removeTempBooking() {
  setInterval(async () => {
    const transaction = await sequelize.transaction();
    try {
      const nowUtc = new Date();
      const tenMinutesAgoUtc = new Date(nowUtc.getTime() - 1000 * 60 * 10);

      const oldBookings = await bookingRepository.getAll({
        bookingTime: {
          [Op.lt]: tenMinutesAgoUtc,
        },
        status: "pending",
      });

      if (!oldBookings.length) return;

      let allSeats = [];

      for (booking of oldBookings) {
        const seatList =
          typeof booking.seats === "string"
            ? booking.seats.split(",").map((s) => s.trim())
            : booking.seats;

        allSeats = allSeats.concat(seatList);
      }

      await seatRepository.bulkUpdate(
        { isBooked: "false" },
        {
          seatNumber: {
            [Op.in]: allSeats,
          },
        },
        transaction
      );
      await transaction.commit();
      await bookingRepository.destroy({
        id: {
          [Op.in]: oldBookings.map((b) => b.id),
        },
      });

      logger.info(`Freed ${allSeats.length} seat(s) from expired bookings`);
    } catch (error) {
      await transaction.rollback();
      logger.error("Error cleaning up temp bookings:", error);
    }
  }, 1000 * 60 * 10);
}

module.exports = {
  removeTempBooking,
};
