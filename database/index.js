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

Poll.hasOne(PollResult, { foreignKey: "poll_id", onDelete: "CASCADE" });
PollResult.belongsTo(Poll, { foreignKey: "poll_id" });

PollOption.hasMany(PollResultValue, { foreignKey: "option_id" });
PollResultValue.belongsTo(PollOption, { foreignKey: "option_id" });

PollResult.hasMany(PollResultValue, { foreignKey: "poll_result_id" });
PollResultValue.belongsTo(PollResult, { foreignKey: "poll_result_id" });

User.hasMany(UserFollow, { as: "followingRelations", foreignKey: "follower_id" });
User.hasMany(UserFollow, { as: "followerRelations", foreignKey: "following_id" });

UserFollow.belongsTo(User, { as: "follower", foreignKey: "follower_id" });
UserFollow.belongsTo(User, { as: "following", foreignKey: "following_id" });

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
};
