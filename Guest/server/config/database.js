const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "guest_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  // process.env.DB_HOST || "dpg-d11dc9je5dus738l7880-a",
  // process.env.DB_PORT || "5432",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false,
  }
);

module.exports = sequelize;
