const { DataTypes } = require("sequelize");
const db = require("./db");

const PollResult = db.define(
  "pollResult",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    totalBallots: { type: DataTypes.INTEGER, allowNull: false },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  { underscored: true }
);

module.exports = PollResult;
