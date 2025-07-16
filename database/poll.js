const { DataTypes } = require("sequelize");
const db = require("./db");

const Poll = db.define(
  "poll",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue:
        "https://online.eou.edu/wp-content/uploads/2020/10/eou_article_psychology-competitiveness_header.jpg",
      validate: {
        isUrl: true,
      },
    },
    description: DataTypes.TEXT,
    allowAnonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("draft", "published", "closed"),
      defaultValue: "draft",
    },
    endAt: DataTypes.DATE,
    allowListOnly: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    publishedAt: DataTypes.DATE,
  },
  {
    underscored: true,
  }
);

module.exports = Poll;
