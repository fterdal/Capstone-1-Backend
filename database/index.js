const db = require("./db");
const User = require("./models/user");
const Poll = require("./models/poll");
const PollOption = require("./models/pollOption");
const VotingRank = require("./models/votingRank");
const Vote = require("./models/vote");

//One to many - user has many polls
User.hasMany(Poll, {
  foreignKey: 'userId',
  // onDelete: 'CASCADE' deletes poll is user is deleted
});


// many to one - Each Poll belongs to one user
Poll.belongsTo(User, {
  foreignKey: 'userId',
});


// One to many - one Poll has many options
Poll.hasMany(PollOption, {
  foreignKey: 'pollId',
  onDelete: "CASCADE", // delete poll_options if poll is deleted
});


// many to one - Each pollOption belongs to one Poll
PollOption.belongsTo(Poll, {
  foreignKey: "pollId"
});


// one to many- each user can submit many votes
User.hasMany(Vote, {
  foreignKey: "userId",
})


// one to one- Each vote(ballot) belongs to a user
Vote.belongsTo(User, {
  foreignKey: "userId",
})


// many to one - Each vote(ballot) belongs to a poll
Vote.belongsTo(Poll, {
  foreignKey: "pollId"
})


// one to many- each vote(ballot) can have many ranked options
Vote.hasMany(VotingRank, {
  foreignKey: "voteId",
})


// many to one - each rank entry belongs to one vote(ballot)
VotingRank.belongsTo(Vote, {
  foreignKey: "voteId",
})


// many to one- Each voteRank belongs to one Polloption
VotingRank.belongsTo(PollOption, {
  foreignKey: 'pollOptionId',
})


module.exports = {
  db,
  User,
  Poll,
  PollOption,
  Vote,
  VotingRank,
};
