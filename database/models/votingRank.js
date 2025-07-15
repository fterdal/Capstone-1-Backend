const { DataTypes } = require("sequelize");
const db = require("../db");

// define the votingRank model

const VotingRank = db.define("votingRank", {
    rank: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
})

module.exports = VotingRank;