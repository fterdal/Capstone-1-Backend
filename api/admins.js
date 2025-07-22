const express = require('express');
const { authenticateJWT, requireAdmin } = require('../auth');
const router = express.Router();
const { User, Poll, Ballot, PollOption } = require("../database");

router.get(
  '/users',
  authenticateJWT,
  requireAdmin,
  async (req, res) => {
    try {
      const users = await User.findAll({ include: [Poll, Ballot] });
      res.status(200).send(users);
    } catch (error) {
      console.error("Error fetching users: ", error);
      res.status(500).send("Error fetching users");
    }
  }
);

router.patch(
  "/polls/:id/close",
  authenticateJWT,
  requireAdmin,
  async (req, res) => {
    try {
      const poll = await Poll.findByPk(req.params.id, {
        include: [PollOption, Ballot],
      });
      if (!poll) return res.status(404).json({ error: "Poll not found" });
      if (poll.status === "closed")
        return res.status(400).json({ error: "Poll already closed" });

      poll.status = "closed";
      poll.isActive = false;
      if (!poll.endAt) poll.endAt = new Date();
      await poll.save();

      res.json(poll);
    } catch (err) {
      console.error("Error closing poll:", err);
      res.status(500).json({ error: "Failed to close poll" });
    }
  }
);

router.patch(
  "/users/:id/disable",
  authenticateJWT,
  requireAdmin,
  async (req, res) => {
    try {
      const target = await User.findByPk(req.params.id);
      if (!target) return res.status(404).json({ error: "User not found" });

      if (target.role === "admin") {
        return res.status(403).json({ error: "Cannot disable an admin account" });
      }

      target.disabled = !target.disabled;
      await target.save();

      res.json({ id: target.id, disabled: target.disabled });
    } catch (err) {
      console.error("Error disabling user:", err);
      res.status(500).json({ error: "Failed to modify user" });
    }
  }
);

module.exports = router;