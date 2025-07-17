const express = require("express");
const router = express.Router();
const { Polls, PollOption } = require("../database");

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
      include: [{ model: PollOption, as: "options" }],
    });

    if (!poll) return res.status(404).send({ error: "Poll not found" });

    const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);

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

    // Stop users from editing a poll after it's been published or ended
    if (["published", "ended"].includes(poll.status)) {
      return res.status(400).json({ error: "Cannot edit a published or ended poll" });
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

// Duplication logic
router.post("/:id/duplicate", async (req, res) => {
  try {
    const originalPoll = await Polls.findByPk(req.params.id, {
      include: [{ model: PollOption, as: "options" }],
    });

    if (!originalPoll) return res.status(404).json({ error: "Poll not found" });

    const duplicatedPoll = await Polls.create({
      user_id: originalPoll.user_id, // or req.user.id if we're using auth
      title: originalPoll.title + " (Copy)",
      description: originalPoll.description,
      status: "draft",
    });

    const duplicatedOptions = await Promise.all(
      originalPoll.options.map((opt) =>
        PollOption.create({
          text: opt.text,
          votes: 0,
          pollId: duplicatedPoll.id,
        })
      )
    );

    res.status(201).json({
      message: "Poll duplicated successfully",
      poll: duplicatedPoll,
      options: duplicatedOptions,
    });
  } catch (err) {
    console.error("Duplicate poll error:", err);
    res.status(500).json({ error: "Failed to duplicate poll" });
  }
});

// Publishing logic and validation added
router.put("/publish/:id", async (req, res) => {
  try {
    const poll = await Polls.findByPk(req.params.id, {
      include: [{ model: PollOption, as: "options" }],
    });

    if (!poll) return res.status(404).json({ error: "Poll not found" });
    if (poll.status !== "draft") return res.status(400).json({ error: "Only draft polls can be published" });

    if (!poll.title || !poll.description) {
      return res.status(400).json({ error: "Title and description are required to publish" });
    }

    if (!poll.options || poll.options.length < 2) {
      return res.status(400).json({ error: "Poll must have at least two options to publish" });
    }

    poll.status = "published";
    poll.publishedAt = new Date(); 
    await poll.save();

    res.send({ message: "Poll published successfully", poll });
  } catch (err) {
    console.error("Publish error:", err);
    res.status(500).json({ error: "Failed to publish poll" });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const deletePoll = await Polls.findByPk(req.params.id);

    if (!deletePoll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    // Protects against polls getting deleted once published
    if (["published", "ended"].includes(deletePoll.status)) {
      return res.status(400).json({ error: "Cannot delete a published or ended poll" });
    }

    await deletePoll.destroy();
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete poll" });
  }
});

module.exports = router;
