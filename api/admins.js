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

module.exports = router;