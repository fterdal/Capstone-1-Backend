const { DataTypes } = require("sequelize");
const db = require("./db");

const Polls = db.define("polls", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
  type: DataTypes.INTEGER,
  allowNull: false,
  references: { model: 'users', key: 'id' }
  },
  title: {
    type: DataTypes.STRING, 
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
});

Polls.associate = (models) => {
  Polls.hasMany(models.PollOptions, {
    foreignKey: "pollId",
    as: "options",
    onDelete: "CASCADE",
  });
};

module.exports = Polls;
