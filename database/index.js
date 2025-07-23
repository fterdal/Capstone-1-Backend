const db = require("./db");
const User = require("./user");
const Poll = require("./poll");
const PollOption = require("./pollOption");
const Ballot = require("./ballot");
const BallotRanking = require("./ballotRanking");
const PollAllowedUser = require("./pollAllowedUser");
const PollResultValue = require("./pollResultValue");
const PollResult = require("./pollResult");
const UserFollow = require("./userFollow");
const PollViewPermission = require("./pollViewPermission");
const PollVotePermission = require("./pollVotePermission");

// User and Poll relationships
User.hasMany(Poll, { foreignKey: "creator_id" });
Poll.belongsTo(User, { as: "creator", foreignKey: "creator_id" });

// Poll and PollOption relationships
Poll.hasMany(PollOption, { foreignKey: "poll_id", onDelete: "CASCADE",as: "PollOptions"});
PollOption.belongsTo(Poll, { foreignKey: "poll_id", as: "Poll"});

// Poll and Ballot relationships
Poll.hasMany(Ballot, { foreignKey: "poll_id", onDelete: "CASCADE" });
Ballot.belongsTo(Poll, { foreignKey: "poll_id" });

// User and Ballot relationships
User.hasMany(Ballot, { foreignKey: "user_id" });
Ballot.belongsTo(User, { foreignKey: "user_id" });

// Ballot and BallotRanking relationships
Ballot.hasMany(BallotRanking, { foreignKey: "ballot_id", onDelete: "CASCADE" });
BallotRanking.belongsTo(Ballot, { foreignKey: "ballot_id" });

// PollOption and BallotRanking relationships
PollOption.hasMany(BallotRanking, { foreignKey: "option_id" });
BallotRanking.belongsTo(PollOption, { foreignKey: "option_id" });

// Poll and PollResult relationships
Poll.hasOne(PollResult, { foreignKey: "poll_id", onDelete: "CASCADE" });
PollResult.belongsTo(Poll, { foreignKey: "poll_id" });

// PollOption and PollResultValue relationships
PollOption.hasMany(PollResultValue, { foreignKey: "option_id" });
PollResultValue.belongsTo(PollOption, { foreignKey: "option_id" });

// PollResult and PollResultValue relationships
PollResult.hasMany(PollResultValue, { foreignKey: "poll_result_id" });
PollResultValue.belongsTo(PollResult, { foreignKey: "poll_result_id" });

// Poll AllowedUsers relationships (existing allowed user system)
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

// User Follow Relationships (mutual following system)
User.belongsToMany(User, {
  through: UserFollow,
  as: "following",
  foreignKey: "follower_id",
  otherKey: "following_id",
});

User.belongsToMany(User, {
  through: UserFollow,
  as: "followers",
  foreignKey: "following_id",
  otherKey: "follower_id",
});

// Additional follow relationships for easier access
User.hasMany(UserFollow, { as: "followingRelations", foreignKey: "follower_id" });
User.hasMany(UserFollow, { as: "followerRelations", foreignKey: "following_id" });

UserFollow.belongsTo(User, { as: "follower", foreignKey: "follower_id" });
UserFollow.belongsTo(User, { as: "following", foreignKey: "following_id" });

// New Poll View Permission Relationships
Poll.belongsToMany(User, {
  through: PollViewPermission,
  as: "viewAllowedUsers",
  foreignKey: "poll_id",
});
User.belongsToMany(Poll, {
  through: PollViewPermission,
  as: "viewablePolls",
  foreignKey: "user_id",
});

// New Poll Vote Permission Relationships
Poll.belongsToMany(User, {
  through: PollVotePermission,
  as: "voteAllowedUsers",
  foreignKey: "poll_id",
});
User.belongsToMany(Poll, {
  through: PollVotePermission,
  as: "votablePolls",
  foreignKey: "user_id",
});

// Direct relationships for permission models
PollViewPermission.belongsTo(Poll, { foreignKey: "poll_id" });
PollViewPermission.belongsTo(User, { foreignKey: "user_id" });

PollVotePermission.belongsTo(Poll, { foreignKey: "poll_id" });
PollVotePermission.belongsTo(User, { foreignKey: "user_id" });

// Additional direct relationships from Poll and User to permission models
Poll.hasMany(PollViewPermission, { foreignKey: "poll_id", onDelete: "CASCADE" });
Poll.hasMany(PollVotePermission, { foreignKey: "poll_id", onDelete: "CASCADE" });

User.hasMany(PollViewPermission, { foreignKey: "user_id", onDelete: "CASCADE" });
User.hasMany(PollVotePermission, { foreignKey: "user_id", onDelete: "CASCADE" });

module.exports = {
  db,
  User,
  Poll,
  PollOption,
  Ballot,
  BallotRanking,
  PollAllowedUser,
  PollResult,
  PollResultValue,
  UserFollow,
  PollViewPermission,
  PollVotePermission,
};