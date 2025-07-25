const express = require("express");
const router = express.Router();
const { User, Poll, Ballot, UserFollow } = require("../database");

//get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.findAll({ 
      include: [
        Poll, 
        Ballot,
        {
          model: User,
          as: "followers",
          attributes: ["id", "username", "imageUrl"],
          through: { attributes: [] }
        },
        {
          model: User,
          as: "following",
          attributes: ["id", "username", "imageUrl"],
          through: { attributes: [] }
        }
      ],
      attributes: { exclude: ['passwordHash'] }
    });
    res.status(200).send(users);
  } catch (error) {
    console.error("Error fetching users: ", error);
    res.status(500).send("Error fetching users");
  }
});

//get a user by id
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        Poll, 
        Ballot,
        {
          model: User,
          as: "followers",
          attributes: ["id", "username", "imageUrl"],
          through: { attributes: ["created_at"] }
        },
        {
          model: User,
          as: "following",
          attributes: ["id", "username", "imageUrl"],
          through: { attributes: ["created_at"] }
        }
      ],
      attributes: { exclude: ['passwordHash'] }
    });
    
    if (!user) {
      return res.status(404).send("User not found");
    }
    
    res.status(200).send(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).send("Error fetching user");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete a user" });
  }
});

//create a user
router.post("/", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const passwordHash = User.hashPassword(password);

    const newUser = { username, email, passwordHash };

    const savedUser = await User.create(newUser);

    res.status(201).send(savedUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send("Error creating user");
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, bio, imageUrl } = req.body;
    
    console.log("Updating user:", userId, req.body); 
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ 
        where: { username },
        attributes: ['id']
      });
      
      if (existingUser && existingUser.id !== parseInt(userId)) {
        return res.status(400).json({ error: "Username already taken" });
      }
    }
    
    const updatedData = {};
    if (username !== undefined) updatedData.username = username.trim();
    if (email !== undefined) updatedData.email = email.trim();
    if (bio !== undefined) updatedData.bio = bio.trim();
    if (imageUrl !== undefined) updatedData.imageUrl = imageUrl.trim();
    
    await user.update(updatedData);
    
    const updatedUser = await User.findByPk(userId, {
      include: [{
        model: Poll,
        include: ['PollOptions'] 
      }],
      attributes: { exclude: ['passwordHash'] }
    });
    
    console.log("User updated successfully:", updatedUser.username);
    
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ 
      error: "Failed to update profile",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

//route to get user stats (followers, following, friend count)
router.get("/:id/stats", async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findByPk(userId, {
      include: [
        {
          model: User,
          as: "followers",
          attributes: ["id"],
          through: { attributes: [] }
        },
        {
          model: User,
          as: "following",
          attributes: ["id"], 
          through: { attributes: [] }
        },
        {
          model: Poll,
          attributes: ["id"]
        }
      ],
      attributes: ["id", "username"]
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const followingIds = user.following.map(f => f.id);
    const followerIds = user.followers.map(f => f.id);
    const friendIds = followingIds.filter(id => followerIds.includes(id));
    
    res.json({
      userId: user.id,
      username: user.username,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      friendsCount: friendIds.length,
      pollsCount: user.polls.length
    });
    
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
});

module.exports = router;
