const { DataTypes } = require("sequelize");
const db = require("./db");

const PollViewPermission = db.define("pollViewPermission", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  poll_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'polls',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['poll_id', 'user_id']
    }
  ]
});

module.exports = PollViewPermission;