const db = require("./db");
const User = require("./user");
const Polls = require("./Polls");
const PollOption = require("./poll_options");
const Vote = require("./vote")
const Ballot = require("./ballot")

Polls.belongsTo(User);
User.hasMany(Polls);


Polls.hasMany(PollOption);
PollOption.belongsTo(Polls);

Ballot.hasMany(Vote);
Vote.belongsTo(Ballot);

// Polls.hasMany(PollOption, {
//   foreignKey: "pollId",
//   as: "options",
//   onDelete: "CASCADE",
// });

// PollOption.belongsTo(Polls, {
//   foreignKey: "pollId",
//   as: "poll",
// });

// Polls.associate?.({ PollOption });
// PollOption.associate?.({ Polls });

module.exports = {
  db,
  User,
  Polls,
  PollOption,
  Ballot,
  Vote,
};

