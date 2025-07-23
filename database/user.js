const { DataTypes, Model } = require("sequelize");
const db = require("./db");
const bcrypt = require("bcrypt");

class User extends Model {
  static hashPassword(password) {
    return bcrypt.hashSync(password, 10);
  }

  static comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
  }

  checkPassword(password) {
    return bcrypt.compareSync(password, this.passwordHash);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    auth0Id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 30],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg",
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    disabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
    },
    viewRestriction: {
      type: DataTypes.ENUM("public", "followers", "friends", "custom"),
      defaultValue: "public",
    },
    voteRestriction: {
      type: DataTypes.ENUM("public", "followers", "friends", "custom"),
      defaultValue: "public",
    },
  },
  {
    sequelize: db,
    modelName: "User",
    tableName: "users",
  }
);

module.exports = User;