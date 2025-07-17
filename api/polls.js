const express = require("express");
const router = express.Router();
const { Poll, PollOption, Ballot, BallotRanking } = require("../database");

router.get("/", async (req, res) => {
  try {
    const polls = await Poll.findAll({
      include: [PollOption, Ballot],
    });
    console.log(`Found ${polls.length} polls`);
    res.status(200).send(polls);
  } catch (error) {
    console.error("Error fetching polls:", error);
    res.status(500).json({
      error: "Failed to fetch polls",
      message: "Check your database connection",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const poll = await Poll.findByPk(req.params.id, {
      include: [
        PollOption,
        {
          model: Ballot,
          include: [BallotRanking]
        }
      ],
    });
    res.status(200).send(poll);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch poll by id" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const poll = await Poll.findByPk(req.params.id, {
      include: [PollOption, Ballot, BallotRanking],
    });
    if (!poll) {
      return res.status(404).json({ error: "poll not found" });
    }
    await poll.destroy();
    res.status(200).json({ message: "Poll deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete a poll" });
  }
});

router.post("/", async (req, res) => {
  try {
    const poll = await Poll.create(req.body);
    res.status(201).send(poll);
  } catch (error) {
    res.status(500).json({ error: "Failed to create a poll" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const [updatedRows] = await Poll.update(req.body, { 
      where: { id: req.params.id },
    });
    if (updatedRows === 0) {
      return res.status(404).send("Poll not found");
    }
    const updatedPoll = await Poll.findByPk(req.params.id);
    res.status(200).send(updatedPoll);
  } catch (error) {
    console.error("Error updating poll:", error);
    res.status(500).send("Error updating poll");
  }
}); 

module.exports = router;
