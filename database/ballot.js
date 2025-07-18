const { DataTypes } = require("sequelize");
const db = require("./db");

const Ballot = db.define("ballot", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  poll_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "polls", key: "id" },
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true, 
    references: { model: "users", key: "id" },
  },
  submitted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, 
  },
});

module.exports = Ballot;
