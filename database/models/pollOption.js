const { DataTypes } = require('sequelize');
const db = require('../db');

// Table Poll_Option {
//   id PK
//   option_text string
//   position integer ("?")
//   poll_id FK
//   created_at timestamp
// }
const pollOption = db.define("pollOption", {
    optionText: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    position: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    pollId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
},
    {
        timestamps: true,
    }
)

module.exports = pollOption;