const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "sql12783467",
  process.env.DB_USER || "sql12783467",
  process.env.DB_PASSWORD || "PqYL2m8mHt",
  process.env.DB_HOST || "sql12.freesqldatabase.com",
  process.env.DB_PORT || "3306",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false,
  }
);

module.exports = sequelize;
