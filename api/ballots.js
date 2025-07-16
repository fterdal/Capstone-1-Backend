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
  const { userId, pollId, rankings } = req.body;

  if (!userId || !pollId || !Array.isArray(rankings) || rankings.length === 0) {
    return res
      .status(400)
      .json({ error: "userId, pollId and rankings[] are required" });
  }

  const t = await sequelize.transaction();
  try {
    const ballot = await Ballot.create(
      { user_id: userId, poll_id: pollId },
      { transaction: t }
    );

    const createRankings = rankings.map(({ pollOptionId, rank }) =>
      BallotRanking.create(
        {
          ballot_id: ballot.id,
          poll_option_id: pollOptionId,
          rank,
        },
        { transaction: t }
      )
    );
    await Promise.all(createRankings);

    await t.commit();
    const result = await Ballot.findByPk(ballot.id, {
      include: [{ model: BallotRanking }],
    });
    res.status(201).json(result);
  } catch (error) {
    await t.rollback();
    console.error("Error creating ballot + rankings:", error);
    res.status(500).json({
      error: "Failed to submit votes",
      message: error.message,
    });
  }
});

module.exports = router;
