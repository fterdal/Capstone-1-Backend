const { DataTypes } = require("sequelize");
const db = require("./db");

const Vote = db.define("vote", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ballot_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "ballots", key: "id" },
  },
  poll_option_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "poll_options", key: "id" },
  },
  rank: {
    type: DataTypes.INTEGER,
    allowNull: true, 
  },
});

module.exports = Vote;
