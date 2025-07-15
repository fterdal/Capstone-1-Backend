const db = require("./db");
const User = require("./user");
const Polls = require("./Polls");
const PollOption = require("./poll_options");

Polls.belongsTo(User);
User.hasMany(Polls),

Polls.hasMany(PollOption);
PollOption.belongsTo(Polls);

module.exports = {
  db,
  User,
  Polls,
  PollOption,
};

