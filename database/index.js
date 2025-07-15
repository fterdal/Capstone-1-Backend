const db = require("./db");
const User = require("./models/user");
const Poll = require("./models/poll");
const PollOption = require("./models/pollOption");
const pollOption = require("./models/pollOption");


//One to many - user has many polls
User.hasMany(Poll, {
  foreignKey: 'userId',
  // onDelete: 'CASCADE' deletes poll is user is deleted
});

// One to one - Each Poll belongs to one user
Poll.belongsTo(User, {
  foreignKey: 'userId',
});

// One to many - one Poll has many options
Poll.hasMany(PollOption, {
  foreignKey: 'pollId',
  onDelete: "CASCASDE", // delete poll_options if poll is deleted
});

// one to one - Each pollOption belongs to one Poll
PollOption.belongsTo(Poll, {
  foreignKey: "pollId"
})
module.exports = {
  db,
  User,
  Poll,
  PollOption,
};
