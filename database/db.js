require("dotenv").config();
const { Sequelize } = require("sequelize");
const pg = require("pg");

// Feel free to rename the database to whatever you want!
const dbName = "capstone_1";

const db = new Sequelize(
  process.env.DATABASE_URL || `postgres://localhost:5432/${dbName}`,
  {
    logging: false, // comment this line to enable SQL logging
  }
);

module.exports = db;
