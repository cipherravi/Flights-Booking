const { Seat } = require("../models");
const CrudRepository = require("./crud-repository");
const { Op, where } = require("sequelize");

class SeatRepository extends CrudRepository {
  constructor() {
    super(Seat);
  }

  async getAirplaneSeats(airplaneId = 76) {
    try {
      const seats = await Seat.findAll({ where: { airplaneId } });
      return seats;
    } catch (error) {
      throw error;
    }
  }

  async updateSeat(airplaneId, row, number, updates) {
    try {
      const seat = await Seat.findOne({
        where: {
          airplaneId,
          row,
          number,
        },
      });

      if (!seat) return null;

      const updatedSeat = await seat.update(updates);

      return updatedSeat;
    } catch (error) {
      throw error;
    }
  }

  async checkSeatAvailability(seatNumbers = [], airplaneId) {
    try {
      const foundSeats = await Seat.findAll({
        where: {
          seatNumber: {
            [Op.in]: seatNumbers,
          },
          isBooked: false,
          airplaneId: airplaneId,
        },
      });

      // If all requested seats are found, return true
      return foundSeats.length === seatNumbers.length;
    } catch (error) {
      throw error;
    }
  }

  async lockSelectedSeat(seatNumbers = [], airplaneId, transaction) {
    return await Seat.findAll({
      where: {
        seatNumber: {
          [Op.in]: seatNumbers,
        },
        isBooked: false,
        airplaneId: airplaneId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
  }

  async updateSeatStatus(seatNumbers, transaction) {
    return await Seat.update(
      { isBooked: "true" },
      {
        where: {
          seatNumber: {
            [Op.in]: seatNumbers,
          },
        },
        transaction,
      }
    );
  }

  async bulkUpdate(data, condition) {
    return Seat.update(data, { where: condition });
  }
}

module.exports = SeatRepository;
