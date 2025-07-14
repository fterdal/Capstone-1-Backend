const { DataTypes } = require("sequelize");
const db = require("./db");

const Ballot = db.define(
  "ballot",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    anonToken: {
      type: DataTypes.UUID,
      unique: true,
      allowNull: true,
    },
    submittedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  { underscored: true }
);

module.exports = Ballot;
