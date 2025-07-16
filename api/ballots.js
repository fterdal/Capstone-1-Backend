const express = require("express");
const router = express.Router();
const {
  Poll,
  User,
  PollOption,
  Ballot,
  BallotRanking,
} = require("../database");

router.get("/", async (req, res) => {
  try {
    const ballots = await Ballot.findAll({ include: BallotRanking });
    console.log(`Found ${ballots.length} ballots`);
    res.status(200).json(ballots);
  } catch (error) {
    console.error("Error fetching ballots:", error);
    res.status(500).json({
      error: "Failed to fetch ballots",
      message: "Check your database connection",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const ballot = await Ballot.findByPk(req.params.id, {
      include: [BallotRanking],
    });
    if (!ballot) {
      return res.status(404).json({ error: "Ballot not found" });
    }
    res.status(200).json(ballot);
  } catch (error) {
    console.error(`Error fetching ballot`, error);
    res.status(500).json({
      error: "Failed to fetch ballot",
      message: "Check your database connection",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const newBallot = await Ballot.create(req.body);
    console.log(`Created ballot ${newBallot.id}`);
    res.status(201).send(newBallot);
  } catch (error) {
    console.error("Error creating ballot:", error);
    res.status(400).json({
      error: "Failed to create ballot",
      message: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const numDeleted = await Ballot.destroy({
      where: { id: req.params.id },
    });
    if (numDeleted === 0) {
      return res.status(404).json({ error: "Ballot not found" });
    }
    console.log(`Deleted ballot ${req.params.id}`);
    res.sendStatus(204);
  } catch (error) {
    console.error(`Error deleting ballot ${req.params.id}:`, error);
    res.status(500).json({
      error: "Failed to delete ballot",
      message: "Check your database connection",
    });
  }
});

module.exports = router;
