const { DataTypes } = require("sequelize");
const db = require("./db");
const bcrypt = require("bcrypt");

const Roles = db.define ("roles", 
    {
        id:
        {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name:
        {
            type: DataTypes.STRING,
            allowNull: false
        },
        description:
        {
            type: DataTypes.TEXT,
            allowNull: true
        }
    });

    module.exports = Roles;