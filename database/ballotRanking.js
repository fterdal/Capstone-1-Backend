const { DataTypes } = require("sequelize");
const db = require("./db");

const BallotRanking = db.define(
  "ballotRanking",
  {
    rank: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    underscored: true,
    indexes: [
      { unique: true, fields: ["ballot_id", "rank"] },
    ],
  }
);

module.exports = BallotRanking;
