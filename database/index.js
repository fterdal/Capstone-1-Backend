const db = require("./db");
const User = require("./models/user");
const Poll = require("./models/poll");
const PollOption = require("./models/pollOption");
const VotingRank = require("./models/votingRank");
const Vote = require("./models/vote");
const RestrictedPollAccess = require('./models/restrictedPollAccess')

//----- User Model--------

//One to many - user has many polls
User.hasMany(Poll, {
  foreignKey: 'userId',
  // onDelete: 'CASCADE' deletes poll is user is deleted
});



//----- Poll Model--------

// many to one - Each Poll belongs to one user
Poll.belongsTo(User, {
  foreignKey: 'userId',
});



//----- PollOption Model--------

// One to many - one Poll has many options
Poll.hasMany(PollOption, {
  foreignKey: 'pollId',
  onDelete: "CASCADE", // delete poll_options if poll is deleted
});

// many to one - Each pollOption belongs to one Poll
PollOption.belongsTo(Poll, {
  foreignKey: "pollId"
});



//----- Vote Model--------

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



//----- Voting Rank Model--------

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



//----- Restricted Access Model--------

//A user can be restricted to many polls
User.belongsToMany(Poll, {
  through: RestrictedPollAccess,
  as: "restrictedPolls",
  foreignKey: "userId"
})

// A poll can belong to many users through Restrictred access
Poll.belongsToMany(User, {
  through: RestrictedPollAccess,
  as: "restictedUsers",
  foreignKey: "pollId",
})

// 



module.exports = {
  db,
  User,
  Poll,
  PollOption,
  Vote,
  VotingRank,
  RestrictedPollAccess,
};
