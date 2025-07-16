const { DataTypes } = require("sequelize");
const db = require("../db");
const bcrypt = require("bcrypt");

const User = db.define("user", {
  username: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      len: [1, 50]
    }
  },
  firstName: {
    type: DataTypes.STRING,
    // allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 50],
    },
  },
  lastName: {
    type: DataTypes.STRING,
    // allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 50],
    },
  },
  email: {
    type: DataTypes.STRING,
    // allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true,
    },
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      notEmpty: true,
    },
  },
  auth0Id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  img: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true,
    },
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  isDisable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
},
  {
    timestamps: true,
    createdAt: 'created_at',
  }
);

// Instance method to check password
User.prototype.checkPassword = function (password) {
  if (!this.passwordHash) {
    return false; // Auth0 users don't have passwords
  }
  return bcrypt.compareSync(password, this.passwordHash);
};

// Class method to hash password
User.hashPassword = function (password) {
  return bcrypt.hashSync(password, 10);
};

module.exports = User;
