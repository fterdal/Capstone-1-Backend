const db = require("./db");
const User            = require("./user");
const Poll            = require("./poll");
const PollOption      = require("./pollOption");
const Ballot          = require("./ballot");
const BallotRanking   = require("./ballotRanking");
const PollAllowedUser = require("./pollAllowedUser");

User.hasMany(Poll, { foreignKey: "creator_id" });
Poll.belongsTo(User, { as: "creator", foreignKey: "creator_id" });

Poll.hasMany(PollOption, { foreignKey: "poll_id", onDelete: "CASCADE" });
PollOption.belongsTo(Poll, { foreignKey: "poll_id" });

Poll.hasMany(Ballot, { foreignKey: "poll_id", onDelete: "CASCADE" });
Ballot.belongsTo(Poll, { foreignKey: "poll_id" });

User.hasMany(Ballot, { foreignKey: "user_id" }); // nullable for anonymous
Ballot.belongsTo(User, { foreignKey: "user_id" });

Ballot.hasMany(BallotRanking, { foreignKey: "ballot_id", onDelete: "CASCADE" });
BallotRanking.belongsTo(Ballot, { foreignKey: "ballot_id" });

PollOption.hasMany(BallotRanking, { foreignKey: "option_id" });
BallotRanking.belongsTo(PollOption, { foreignKey: "option_id" });

Poll.belongsToMany(User, {
  through: PollAllowedUser,
  as: "allowedUsers",
  foreignKey: "poll_id",
});
User.belongsToMany(Poll, {
  through: PollAllowedUser,
  as: "allowedPolls",
  foreignKey: "user_id",
});

module.exports = {
  db,
  User,
  Poll,
  PollOption,
  Ballot,
  BallotRanking,
  PollAllowedUser,
};