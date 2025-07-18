const { DataTypes } = require('sequelize');
const db = require('../db');

// define the Poll model

const Poll = db.define("poll", {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        // allowNull: true,
    },
    participants: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM("draft", "published", "ended"),
        allowNull: false,
    },
    deadline: {
        type: DataTypes.DATE,
        // allowNull: false,
    },
    authRequired: {
        type: DataTypes.BOOLEAN, // allow only user votes if true
        default: false,
    },
    isDisabled: {
        type: DataTypes.BOOLEAN, // if true poll is disabled by admin
        default: false,
    },
    restricted: {
        type: DataTypes.BOOLEAN, // only specic users can parcipate if true
        default: false,
    },
    slug: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
      
},
    {
        timestamps: true,
    }
);

//slug creation 

function slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  }

  // generate a random string
  function generateRandomString(length = 6) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
  
  //auto-generate slug
  Poll.beforeValidate(async (poll) => {
    if (!poll.slug) {
        const baseSlug = slugify(poll.title);
        let uniqueSlug = baseSlug;

        while (await Poll.findOne({where: {slug: uniqueSlug}})){
            uniqueSlug = `${baseSlug}-${generateRandomString()}`;
        }
        poll.slug = uniqueSlug;
    }
  })



module.exports = Poll;