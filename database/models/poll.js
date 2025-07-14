const {DataTypes} = require('sequelize');
const db = require('../db');

// define the Poll model

const Poll = db.define("poll", {
    title: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.TEXT
    },
    participants: {
        type: DataTypes.INTEGER
    },
    status: {
        type: DataTypes.STRING // draft, published , ended
    },
    deadline: {
        type: DataTypes.TIME
    },
    authRequired: {
        type: DataTypes.BOOLEAN, // allow only user votes if true
        default: false
    },
    isDisabled: {
        type: DataTypes.BOOLEAN, // if true poll is disabled by admin
        default: false
    },
    restricted: {
        type: DataTypes.BOOLEAN, // only specic users can parcipate if true
        default: false
    }
});

module.exports = Poll;