const { DataTypes } = require('sequelize');
const db = require('../db');

// define the Poll model

const Poll = db.define("poll", {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        // allowNull: true,
    },
    participants: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM("draft", "published", "ended"),
        allowNull: false,
    },
    deadline: {
        type: DataTypes.DATE,
        // allowNull: false,
    },
    authRequired: {
        type: DataTypes.BOOLEAN, // allow only user votes if true
        default: false,
    },
    isDisabled: {
        type: DataTypes.BOOLEAN, // if true poll is disabled by admin
        default: false,
    },
    restricted: {
        type: DataTypes.BOOLEAN, // only specic users can parcipate if true
        default: false,
    },
},
    {
        timestamps: true,
    }
);

module.exports = Poll;