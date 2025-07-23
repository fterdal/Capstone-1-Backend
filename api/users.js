const express = require("express");
const router = express.Router();
const { User } = require("../database");
const { authenticateJWT, isAdmin } = require("../auth");

// GET /api/users - admin only
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

module.exports = router;
