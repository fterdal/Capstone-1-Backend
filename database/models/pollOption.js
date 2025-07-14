const { DataTypes } = require('sequelize');
const db = require('../db');

// Table Poll_Option {
//   id PK
//   option_text string
//   position integer ("?")
//   poll_id FK
//   created_at timestamp
// }
const pollOption = db.define("poll", {
    optionText: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    position: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    timestamps: true,

})

module.exports = pollOption;