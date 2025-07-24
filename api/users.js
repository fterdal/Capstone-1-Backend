const express = require("express");
const router = express.Router();
const { User } = require("../database");
const { authenticateJWT, isAdmin } = require("../auth");

// GET /api/users , admin only
router.get("/", authenticateJWT, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// PATCH /api/users/:userId/disable - admin only (toggle disable status)
router.patch('/:userId/disable', authenticateJWT, isAdmin, async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.isDisable = !user.isDisable;
    await user.save();
    res.json({ message: `User account ${user.isDisable ? 'disabled' : 'enabled'}`, userId: user.id, isDisable: user.isDisable });
  } catch (error) {
    console.error('Error toggling user disable:', error);
    res.status(500).json({ error: 'Failed to toggle user disable' });
  }
});

// GET /api/users/:userId - fetch user profile info
router.get('/:userId', authenticateJWT, async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByPk(userId, {
      attributes: [
        'id',
        'firstName',
        'lastName',
        'email',
        'username',
        'img',
        'isAdmin',
        'isDisable',
        'createdAt',
        'updatedAt'
      ]
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});
// PATCH /api/users/:userId - update user profile info
router.patch('/:userId', authenticateJWT, async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, email, username, img } = req.body;
  // only allow user to edit their own account
  if (parseInt(userId) !== req.user.id) {
    return res.status(403).json({ error: 'you can only edit your own account' });
  }
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (username) user.username = username;
    if (img) user.img = img
    await user.save();
    res.json({ message: 'User profile updated successfully', user });
  } catch (error) {
    // handle unique constraint errors for email and username
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Email or username already in use' });
    }
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});
    

module.exports = router;
