const db = require("./db");
const User = require("./models/user");
const Poll = require("./models/poll");
const PollOption = require("./models/pollOption")

module.exports = {
  db,
  User,
  Poll,
  PollOption,
};
