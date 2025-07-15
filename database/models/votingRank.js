const { DataTypes } = require("sequelize");
const db = require("../db");

// define the votingRank model

const VotingRank = db.define("votingRank", {
    voteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    pollOptionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    rank: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
})

module.exports = VotingRank;