const db = require("./db");

const PollAllowedUser = db.define(
  "pollAllowedUser",
  {},
  { timestamps: false, underscored: true }
);

module.exports = PollAllowedUser;
