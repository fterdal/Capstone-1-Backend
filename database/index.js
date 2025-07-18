const db = require("./db");
const User = require("./user");
const Polls = require("./Polls");
const PollOption = require("./poll_options");
const Vote = require("./vote");
const Ballot = require("./ballot");

//Bidirectional relationship logic
// USER ↔ POLLS
Polls.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Polls, { foreignKey: "user_id" });

// POLLS ↔ OPTIONS
Polls.hasMany(PollOption, {
  foreignKey: "pollId",
  as: "options",
  onDelete: "CASCADE",
});
PollOption.belongsTo(Polls, {
  foreignKey: "pollId",
  as: "poll",
});

// BALLOT ↔ VOTE
Ballot.hasMany(Vote, {
  foreignKey: "ballotId",
  as: "votes",
});
Vote.belongsTo(Ballot, {
  foreignKey: "ballotId",
  as: "ballot",
});

Ballot.belongsTo(Polls, {
  foreignKey: "poll_id",
  as: "poll",
});

Ballot.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

Vote.belongsTo(PollOption, {
  foreignKey: "pollOptionId",
  as: "option",
});
PollOption.hasMany(Vote, {
  foreignKey: "pollOptionId",
  as: "votes",
});

module.exports = {
  db,
  User,
  Polls,
  PollOption,
  Ballot,
  Vote,
};
