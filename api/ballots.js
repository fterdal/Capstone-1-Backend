const express = require("express");
const router = express.Router();
const {Poll, User, PollOption, Ballot, BallotRanking} = require("../database");

router.get("/", async (req, res) => {
  try {
    const ballots = await Ballot.findAll(
      // {include: [Poll, User, PollOption, BallotRanking]}
      );
    console.log(`Found ${ballots.length} ballots`);
    res.status(200).send(ballots);
  } catch (error) {
    console.error("Error fetching ballots:", error);
    res.status(500).json({
      error: "Failed to fetch ballots",
      message: "Check your database connection",
    });
  }
});

module.exports = router;