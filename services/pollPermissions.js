const { User, UserFollow, PollViewPermission, PollVotePermission } = require("../database");
const { Op } = require("sequelize");

const checkPollViewPermission = async (poll, userId) => {
  if (poll.viewRestriction === "public") {
    return true;
  }

  if (!userId) {
    return false;
  }

  if (poll.creator_id === userId) {
    return true;
  }

  switch (poll.viewRestriction) {
    case "followers":
      const isFollowing = await UserFollow.findOne({
        where: {
          follower_id: userId,
          following_id: poll.creator_id
        }
      });
      return !!isFollowing;

    case "friends":
      const [userFollowsCreator, creatorFollowsUser] = await Promise.all([
        UserFollow.findOne({
          where: { follower_id: userId, following_id: poll.creator_id }
        }),
        UserFollow.findOne({
          where: { follower_id: poll.creator_id, following_id: userId }
        })
      ]);
      return !!(userFollowsCreator && creatorFollowsUser);

    case "custom":
      const hasCustomPermission = await PollViewPermission.findOne({
        where: {
          poll_id: poll.id,
          user_id: userId
        }
      });
      return !!hasCustomPermission;

    default:
      return false;
  }
};

const checkPollVotePermission = async (poll, userId) => {
  const canView = await checkPollViewPermission(poll, userId);
  if (!canView) {
    return false;
  }

  if (poll.voteRestriction === "public") {
    return true;
  }

  if (!userId) {
    return false;
  }

  if (poll.creator_id === userId) {
    return true;
  }

  switch (poll.voteRestriction) {
    case "followers":
      const isFollowing = await UserFollow.findOne({
        where: {
          follower_id: userId,
          following_id: poll.creator_id
        }
      });
      return !!isFollowing;

    case "friends":
      const [userFollowsCreator, creatorFollowsUser] = await Promise.all([
        UserFollow.findOne({
          where: { follower_id: userId, following_id: poll.creator_id }
        }),
        UserFollow.findOne({
          where: { follower_id: poll.creator_id, following_id: userId }
        })
      ]);
      return !!(userFollowsCreator && creatorFollowsUser);

    case "custom":
      const hasCustomPermission = await PollVotePermission.findOne({
        where: {
          poll_id: poll.id,
          user_id: userId
        }
      });
      return !!hasCustomPermission;

    default:
      return false;
  }
};

module.exports = {
  checkPollViewPermission,
  checkPollVotePermission,
};