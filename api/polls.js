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
    const poll = await Poll.findByPk(req.params.id);
    
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }
    await BallotRanking.destroy({
      include: [{
        model: Ballot,
        where: { poll_id: req.params.id }
      }]
    });

    await Ballot.destroy({
      where: { poll_id: req.params.id }
    });

    await PollOption.destroy({
      where: {poll_id: req.params.id}
    });
    await poll.destroy();
    
    res.status(200).json({ 
      message: "Poll and all related data deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting poll:", error);
    res.status(500).json({ error: "Failed to delete poll" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { pollOptions, ...pollData } = req.body;
    const poll = await Poll.create(pollData);
    
    if (pollOptions && Array.isArray(pollOptions) && pollOptions.length > 0) {
      const options = pollOptions.map((option, index) => ({
        text: option.text,
        position: option.position || index + 1,
        poll_id: poll.id 
      }));

      await PollOption.bulkCreate(options);
    }
  
    const pollWithOptions = await Poll.findByPk(poll.id, {
      include: [PollOption]
    });
    
    res.status(201).send(pollWithOptions);
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).json({ error: "Failed to create a poll" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { pollOptions, ...pollData } = req.body; 
    
    const existingPoll = await Poll.findByPk(req.params.id);
    if (!existingPoll) {
      return res.status(404).send("Poll not found");
    }
    
    if (Object.keys(pollData).length > 0) {
      await Poll.update(pollData, {
        where: { id: req.params.id },
      });
    }
    
    if (pollOptions && Array.isArray(pollOptions)) {
      await PollOption.destroy({
        where: { poll_id: req.params.id }
      });
      
      const newOptions = pollOptions.map((option, index) => ({
        text: option.text,
        position: option.position || index + 1,
        poll_id: req.params.id
      }));
      
      await PollOption.bulkCreate(newOptions);
    }
    
    const updatedPoll = await Poll.findByPk(req.params.id, {
      include: [PollOption]
    });
    
    res.status(200).send(updatedPoll);
  } catch (error) {
    console.error("Error updating poll:", error);
    res.status(500).send("Error updating poll");
  }
});

module.exports = router;
