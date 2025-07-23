const express = require("express");
const router = express.Router();
const { User } = require("../database");
const { authenticateJWT, isAdmin } = require("../auth");

// GET /api/users , admin only
router.get("/", authenticateJWT, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "email", "createdAt", "updatedAt", "status"]
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// PATCH /api/users/:userId/disable //// admin only
router.patch('/:userId/disable', authenticateJWT, isAdmin, async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.isDisable = true;
    await user.save();
    res.json({ message: 'User account disabled', userId: user.id });
  } catch (error) {
    console.error('Error disabling user:', error);
    res.status(500).json({ error: 'Failed to disable user' });
  }
});

module.exports = router;
