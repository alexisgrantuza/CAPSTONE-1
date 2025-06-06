"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("TimeRecords", "roomId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Rooms",
        key: "id",
      },
      after: "guestId",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("TimeRecords", "roomId");
  },
};
