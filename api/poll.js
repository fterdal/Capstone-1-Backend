const express = require("express");
const router = express.Router();
const { Polls } = require("../database");
const { Polls, Option } = require("../database");

router.get("/", async (req, res) => {
  try {
    const polls = await Polls.findAll();
    res.status(200).send(polls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch polls" });
  }
});

// Adjusted poll id logic to include options, more info and vote count
router.get("/:id", async (req, res) => {
  try {
    const poll = await Polls.findByPk(req.params.id, {
      include: [Option],
    });

    if (!poll) return res.status(404).send({ error: "Poll not found" });

    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    res.send({
      id: poll.id,
      title: poll.title,
      description: poll.description,
      status: poll.status,
      endTime: poll.endTime,
      options: poll.options,
      totalVotes,
    });
  } catch (err) {
    console.error("Error getting poll:", err);
    res.status(500).send({ error: "Server error" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const poll = await Polls.findByPk(req.params.id);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    const updatedPoll = await poll.update(req.body);
    res.send(updatedPoll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update poll" });
  }
});


router.post("/", async (req, res) => {
  try {
    const createPoll = await Polls.create(req.body);
    res.status(201).send(createPoll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create poll" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletePoll = await Polls.findByPk(req.params.id);
    if (!deletePoll) {
      return res.status(404).json({ error: "Poll not found" });
    }
    await deletePoll.destroy();
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete poll" });
  }
});

module.exports = router;
