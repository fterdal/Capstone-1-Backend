const { DataTypes } = require('sequelize');
const db = require('../db');

// define the Vote model

const Vote = db.define("vote", {
    submitted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    voterToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    pollId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = Vote;