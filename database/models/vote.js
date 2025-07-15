const { DataTypes } = require('sequelize');
const db = require('../db');

// define the Vote model

const Vote = db.define("vote", {
    submitted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false // if false; vote has not yet been submited; ballot can still be edited
    },
    voterToken: {
        type: DataTypes.STRING,
        allowNull: true, // this allows us to uniquely identify a guest . we can track if they voted.
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,   // same as voter token we can use either
    },
},
    {
        timestamps: true,
    }
);

module.exports = Vote;