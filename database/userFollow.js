const { DataTypes } = require("sequelize");
const db = require("./db");

const UserFollow = db.define("userfollow", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  follower_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  following_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['follower_id', 'following_id']
    }
  ],
  validate: {
    notSelfFollow() {
      if (this.follower_id === this.following_id) {
        throw new Error('Users cannot follow themselves');
      }
    }
  }
});

module.exports = UserFollow;