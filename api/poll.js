const express = require("express");
const router = express.Router();
const { Polls } = require("../database");

router.get("/", async (req, res) => {
  try {
    const polls = await Polls.findAll();
    res.status(200).send(polls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch polls" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const poll = await Polls.findByPk(req.params.id);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }
    res.json(poll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch poll" });
  }
});


module.exports = router;