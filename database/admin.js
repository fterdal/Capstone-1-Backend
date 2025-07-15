const { DataTypes } = require("sequelize");
const db = require("./db");
const bcrypt = require("bcrypt");

const Admin = db.define ("admins",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: false,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allownull: false,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  });
