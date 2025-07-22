const express = require("express");
const router = express.Router();
const { User, UserFollow } = require("../database");
const { Op } = require("sequelize");

router.post("/", async (req, res) => {
  try {
    const { follower_id, following_id } = req.body;
    
    if (follower_id === following_id) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }
    
    const existingFollow = await UserFollow.findOne({
      where: { follower_id, following_id }
    });
    
    if (existingFollow) {
      return res.status(400).json({ error: "Already following this user" });
    }
    
    const follow = await UserFollow.create({ follower_id, following_id });
    
    res.status(201).json({ 
      message: "Successfully followed user",
      follow 
    });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ error: "Failed to follow user" });
  }
});

router.delete("/", async (req, res) => {
  try {
    const { follower_id, following_id } = req.body;
    
    const deletedCount = await UserFollow.destroy({
      where: { follower_id, following_id }
    });
    
    if (deletedCount === 0) {
      return res.status(404).json({ error: "Follow relationship not found" });
    }
    
    res.json({ message: "Successfully unfollowed user" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ error: "Failed to unfollow user" });
  }
});

router.get("/:userId/followers", async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const user = await User.findByPk(userId, {
      include: [{
        model: User,
        as: "followers",
        attributes: ["id", "username", "imageUrl"],
        through: { attributes: ["created_at"] }
      }],
      attributes: ["id", "username"]
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({
      user: { id: user.id, username: user.username },
      followers: user.followers,
      count: user.followers.length
    });
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ error: "Failed to fetch followers" });
  }
});

router.get("/:userId/following", async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const user = await User.findByPk(userId, {
      include: [{
        model: User,
        as: "following",
        attributes: ["id", "username", "imageUrl"],
        through: { attributes: ["created_at"] }
      }],
      attributes: ["id", "username"]
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({
      user: { id: user.id, username: user.username },
      following: user.following,
      count: user.following.length
    });
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ error: "Failed to fetch following" });
  }
});

router.get("/:userId/friends", async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const following = await UserFollow.findAll({
      where: { follower_id: userId },
      attributes: ["following_id"]
    });
    
    const followingIds = following.map(f => f.following_id);
    
    if (followingIds.length === 0) {
      return res.json({ friends: [], count: 0 });
    }
    
    const mutualFollows = await UserFollow.findAll({
      where: {
        follower_id: { [Op.in]: followingIds },
        following_id: userId
      },
      include: [{
        model: User,
        as: "follower",
        attributes: ["id", "username", "imageUrl"]
      }]
    });
    
    const friends = mutualFollows.map(mf => mf.follower);
    
    res.json({
      friends,
      count: friends.length
    });
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ error: "Failed to fetch friends" });
  }
});

router.get("/:userId/status/:targetUserId", async (req, res) => {
  try {
    const { userId, targetUserId } = req.params;
    
    const [isFollowing, isFollowed] = await Promise.all([
      UserFollow.findOne({ where: { follower_id: userId, following_id: targetUserId } }),
      UserFollow.findOne({ where: { follower_id: targetUserId, following_id: userId } })
    ]);
    
    const areFriends = !!(isFollowing && isFollowed);
    
    res.json({
      isFollowing: !!isFollowing,
      isFollowedBy: !!isFollowed,
      areFriends
    });
  } catch (error) {
    console.error("Error checking follow status:", error);
    res.status(500).json({ error: "Failed to check follow status" });
  }
});

module.exports = router;