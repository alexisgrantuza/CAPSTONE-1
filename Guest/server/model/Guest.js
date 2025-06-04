const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const TimeRecord = require("./TimeRecord");
const Room = require("./Room");

const Guest = sequelize.define("Guest", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timeIn: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
  timeOut: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Room,
      key: "id",
    },
  },
});

// Define the relationships
Guest.hasMany(TimeRecord, { foreignKey: "guestId" });
TimeRecord.belongsTo(Guest, { foreignKey: "guestId" });
Guest.belongsTo(Room, { foreignKey: "roomId" });
Room.hasMany(Guest, { foreignKey: "roomId" });

module.exports = Guest;
