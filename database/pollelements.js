const { DataTypes } = require("sequelize");
const db = require("./db");
const bcrypt = require("bcrypt");

const pollElements = db.define("pollelements", {
  element_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 20],
    },
  },
  poll_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    allowNull: true,
  },
  clicked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  picture: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.TIME,
    allowNull: false,
  },
});

// Instance method to check password
// User.prototype.checkPassword = function (password) {
//   if (!this.passwordHash) {
//     return false; // Auth0 users don't have passwords
//   }
//   return bcrypt.compareSync(password, this.passwordHash);
// };

// Class method to hash password
// User.hashPassword = function (password) {
//   return bcrypt.hashSync(password, 10);
// };

module.exports = pollElements;
