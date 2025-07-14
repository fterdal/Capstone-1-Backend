const { DataTypes } = require("sequelize");
const db = require("./db");

const PollOption = db.define(
  "pollOption",
  {
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  { underscored: true }
);

module.exports = PollOption;