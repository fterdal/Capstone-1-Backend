const { DataTypes } = require("sequelize");
const db = require("../db");

// Table Restricted_Poll_Access {
//   id PK
//   poll_id FK [ref: > Poll.id]
//   user_id FK [ref: > User.id]
//   created_at timestamp
//   }
const RestrictedPollAccess = db.define("restrictedPollAccess", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    pollId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
},
    {
        timestamps: true,
    }
)

module.exports = RestrictedPollAccess;