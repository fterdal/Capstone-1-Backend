const { DataTypes } = require("sequelize");
const db = require("./db");

const PollOptions = db.define("poll_option", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pollId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "polls",
      key: "id",
    },
  },
});

PollOptions.associate = (models) => {
  PollOptions.belongsTo(models.Polls, {
    foreignKey: "pollId",
    as: "poll",
  });
};

module.exports = PollOptions;
