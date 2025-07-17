const { DataTypes } = require("sequelize");
const db = require("./db");

const PollResultValue = db.define(
  "pollResultValue",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    roundNumber: { type: DataTypes.INTEGER, allowNull: false },
    optionText: { type: DataTypes.STRING, allowNull: false },
    votes: { type: DataTypes.INTEGER, allowNull: false },
  },
  { underscored: true }
);

module.exports = PollResultValue;
