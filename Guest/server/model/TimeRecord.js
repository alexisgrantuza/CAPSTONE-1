const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TimeRecord = sequelize.define("TimeRecord", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  guestId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Guests",
      key: "id",
    },
  },
  type: {
    type: DataTypes.ENUM("timeIn", "timeOut"),
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = TimeRecord;
