const express = require('express');
const { authenticateJWT, requireAdmin } = require('../auth');
const router = express.Router();
const { User, Poll, Ballot } = require("../database");

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

module.exports = router;