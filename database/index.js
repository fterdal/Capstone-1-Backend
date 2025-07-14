const db = require("./db");
const User = require("./user");
const Poll = require("./poll");
const PollOption = require("./pollOption");
const Ballot = require("./ballot");

module.exports = {
  db,
  User,
  Poll,
  PollOption,
  Ballot,
};
