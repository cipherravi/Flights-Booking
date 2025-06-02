"use strict";
const { Model } = require("sequelize");
const { ENUMS } = require("../utils/common");
const { BOOKED, PENDING, CANCELLED, INITIATED } = ENUMS.BOOKING_STATUS;
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Booking.init(
    {
      userId: { type: DataTypes.INTEGER, allowNull: false },
      flightId: { type: DataTypes.INTEGER, allowNull: false },
      airplaneId: { type: DataTypes.INTEGER, allowNull: false },
      seats: { type: DataTypes.STRING, allowNull: false },
      totalPrice: { type: DataTypes.FLOAT, allowNull: false },
      bookingTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      isPaid: { type: DataTypes.BOOLEAN, defaultValue: false },
      status: {
        type: DataTypes.ENUM,
        values: [BOOKED, PENDING, CANCELLED, INITIATED],
        defaultValue: INITIATED,
        allowNull: false,
      },
      idempotencyKey: {
        type: DataTypes.CHAR(36),
        unique: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Booking",
      timestamps: true,
    }
  );
  return Booking;
};
