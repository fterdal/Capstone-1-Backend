const express = require("express");
const router = express.Router();
const { Poll, PollOption, Vote, VotingRank } = require("../database");
const { authenticateJWT } = require("../auth");
const { where } = require("sequelize");

// Get all users Polls----------------------------
router.get("/", authenticateJWT, async (req, res) => {
  const userId = req.user.id;

  try {
    const userPolls = await Poll.findAll({ where: { userId } });
    res.json(userPolls);
  } catch (error) {
    res.status(500).json({ error: "Failed to get all polls" });
  }
});

//Get all draft polls by user--------------------

router.get("/draft", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  try {
    const draftPolls = await Poll.findAll({
      where: {
        userId,
        status: "draft",
      },
    });
    const specialDelivery = {
      message:
        draftPolls.length === 0
          ? "There no polls to display"
          : "Polls successfully retrived",
      polls: draftPolls, // polls is an array of objects
    };

    specialDelivery.polls.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    specialDelivery.polls.map((poll) => {
      console.log(poll.createdAt);
    });

    res.status(200).json(specialDelivery);
  } catch (error) {
    res.status(500).json({ error: "Failed to get drafted polls" });
  }
});

// Get polls by slug
router.get("/slug/:slug", authenticateJWT, async (req, res) => {
  try {
    const pollSlug = req.params.slug;
    const poll = await Poll.findOne({
      where: { slug: pollSlug },
      include: [
        {
          model: PollOption,
        },
      ],
    });

    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }
    res.json(poll);
  } catch (error) {
    res.status(500).json({ error: "Failed to get poll" });
  }
});

//Get a users poll by id with options-----------------
router.get("/:pollId", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const { pollId } = req.params;
  console.log(pollId);
  console.log(userId);

  try {
    // fetch a spcific poll with options that belong to this user
    const poll = await Poll.findOne({
      where: {
        id: pollId,
        userId: userId,
      },
      include: { model: PollOption },
    });

    if (!poll) {
      return res.status(404).json({ error: "No polls found" });
    }
    res.json(poll);
  } catch (error) {
    console.error("Error fetching poll:", error);
    res.status(500).json({ error: "Failed to get poll by ID" });
  }
});

// Create polls---------------------------
router.post("/", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const { title, description, deadline, status, options = [] } = req.body;

  if (status === "published" && options.length < 2) {
    return res.status(400).json({
      error: " 2 options are requires to  publish a poll",
    });
  }
  try {
    const newPoll = await Poll.create({
      title,
      description,
      deadline,
      status,
      userId,
    });
    //[opttion1, option2, option3]
    if (options.length > 0) {
      const formattedOptions = options.map((text) => ({
        optionText: text,
        pollId: newPoll.id,
      }));

      await PollOption.bulkCreate(formattedOptions);
      return res.status(201).json({
        message: "Poll and options created",
        poll: newPoll,
      });
    }
    return res.json(newPoll);
  } catch (error) {
    console.error("Poll creation failed:", error);
    res.status(500).json({
      error: "Failed to create poll",
      message: "Check that API fields and data are correct",
    });
  }
});

//Edit polls--------------------
router.patch("/:pollId", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const poll = req.body;
  const { title, description, deadline, status, options = [] } = req.body;
  const newBody = {
    title,
    description,
    deadline,
    status,
  };
  const { pollId } = req.params;

  try {
    const updatePoll = await Poll.findByPk(pollId);

    if (!updatePoll) {
      return res.status(404).json({ error: "poll not found" });
    } else if (updatePoll.userId !== userId) {
      return res
        .status(403)
        .json({ error: "poll does not belong to this user" });
    }

    if (updatePoll.status === "draft") {
      const updatedPoll = await updatePoll.update(newBody);
      const optionsToDestroy = await PollOption.destroy({ where: { pollId } });

      // [option1, option2, option3]
      // formattedOptions = [
      //     {
      //         optionText: 'option1',
      //         pollId: pollId,
      //     },
      //     {
      //         optionText: 'option2',
      //         pollId: pollId,
      //     },
      //     {
      //         optionText: 'option3',
      //         pollId: pollId,
      //     }
      // ];

      const formattedOptions = await options.map((text) => ({
        optionText: text,
        pollId: pollId,
      }));

      const newPollOptions = await PollOption.bulkCreate(formattedOptions);

      return res.json(newBody);
    }

    if (updatePoll.status === "published") {
      const updateDeadline = await updatePoll.update({ deadline });
      return res.json(updateDeadline);
    }
    return res
      .status(400)
      .json({ error: "Invalid poll status string or update not allowed" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      error: "Failed to update poll",
      message: "Only deadline can be edited when poll is published",
    });
  }
});

//delete draft poll-------------------------
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    const pollId = req.params.id;
    const userId = req.user.id;

    const poll = await Poll.findByPk(pollId);

    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    if (poll.userId !== userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized action: You do not own this poll" });
    }

    if (poll.status !== "draft") {
      return res.status(401).json({
        error: "Unauthorized action: Only draft polls can be deleted",
      });
    }

    await poll.destroy();

    res.json({ message: "Draft poll deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete draft poll" });
  }
});

//-------------------------------------------------------------- Create A vote ballot --------------------------------------------
router.post("/:pollId/vote", authenticateJWT, async (req, res) => {
  // rankings = [
  //   { optionId: 1, rank: 1 },
  //   { optionId: 2, rank: 2 },
  // ];
  console.log("Vote route hit");
  const userId = req.user.id;
  console.log("User Id", userId)

  const { pollId } = req.params;
  console.log("Poll Id", pollId)
  const { rankings } = req.body;
  if (!userId) {
    return res.status(404).json({ error: "Unathorized action" });
  }

  try {
    // I know I am going to need the options that belong to this poll so I should query this poll and include the options

    const poll = await Poll.findOne({
      where: { id: pollId },
      include: { model: PollOption },
    });
    // return res.send(poll) this is returns the poll that I want

    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    // I want to create a new vote only if a vote does not already exist

    // Now that we have the poll we are workgin with I want to look at the vote that belongs to this poll
    const vote = await Vote.findOne({
      where: { userId: userId, pollId: pollId },
      include: { model: VotingRank },
    });
    if (vote) {
      return res
        .status(401)
        .json({ error: "A vote for this poll aready exist" });
    }

    const newVote = await Vote.create({ userId, pollId, submitted: true })
    // return res.send(newVote)
    // I created the a new vote and linked it to the user and the poll now i need to create a new vote_ranking and link it to this vote
    const formattedVotingRank = rankings.map((rank) => {
      return { pollOptionId: rank.optionId, voteId: newVote.id, rank: rank.rank }
    })

    console.log(formattedVotingRank)
    const newVoteRanking = await VotingRank.bulkCreate(formattedVotingRank)
    // return res.send(newVoteRanking)

    const completedVote = await Vote.findOne({
      where: { userId: userId, pollId: pollId },
      include: { model: VotingRank, include: { model: PollOption, attributes: ['id', 'optionText'] } },
    });
    // if (newVote.submitted === false) {
    //       vote.submitted = true;
    //       await newVotevote.save();
    //     }
    return res.send(completedVote);

    // Recap I have the target Poll then I featch the vote that belongs to the user and this poll .. after getting the vote
    // i was able to fetech all rankings that belongs to this vote

    // I now know that i am able to fetch all the data the I need .. however I am fetchin a vote that already exist but has not been submitted
    // if (vote.submitted === true) {
    //   return res.status(401).json({
    //     error: "this user has already submitted a  vote for this poll",
    //   });
    // }


    // return res.send(vote);

    /// so from here i have succesfully submitted a vote now i need to go back to the top and create a new vote with new rankings since
    // what I accomplish was to submit a vote predefined in the seed.js
  } catch (error) {
    console.log("Fatal error");
    return res.status(500).json({ error: "Failed to submit a vote" });
  }



});

//------------------------------------ Calculate results -------------------------------------------------------- 

router.get("/:pollId/results", authenticateJWT, async (req, res) => {


  const userId = req.user.id;
  const { pollId } = req.params;

  const votes = await Vote.findAll({
    where: { pollId: pollId },
    include: { model: VotingRank },
  });

  const allBallots = votes.map(vote => vote.votingRanks);

  const ballots = allBallots.map(ballot => {
    return ballot
      .sort((a, b) => a.rank - b.rank)
      .map((element) => element.pollOptionId)
  })

  const options = await PollOption.findAll({ where: { pollId: pollId } })

  const optionsMap = {};

  for (const option of options) {
    optionsMap[option.id] =
    {
      name: option.optionText,
      count: 0,
      eliminated: false,
    };
  }


  const totalVotes = ballots.length;
  console.log(totalVotes)
  const majorityThreshhold = Math.floor(totalVotes / 2) + 1;
  console.log(majorityThreshhold)


  let foundWinner = false;

  while (!foundWinner) {

    for (const option of Object.values(optionsMap)) {
      option.count = 0;
    }

    for (const ballot of ballots) {
      for (const optionId of ballot) {
        const option = optionsMap[optionId];
        if (!option.eliminated) {
          option.count += 1;
          break;
        }
      }
    }


    for (const [id, option] of Object.entries(optionsMap)) {
      if (option.count > majorityThreshhold) {
        foundWinner = true;
        return res.json({
          status: "winner",
          optionId: id,
          name: option.name,
          voteCount: option.count,
          totalVotes,
        });
      }
    }


    let minCount = Infinity;
    let optionToEliminate = [];


    for (const [optionId, option] of Object.entries(optionsMap)) {
      if (!option.eliminated) {
        if (option.count < minCount) {
          minCount = option.count;
          optionToEliminate = [optionId];
        } else if (option.count === minCount) {
          optionToEliminate.push(optionId)
        }
      }
    }
    console.log(optionToEliminate)
    console.log(minCount);

    const remaining = Object.values(optionsMap).filter((option) => !option.eliminated);

    if (remaining.length === optionToEliminate.length) {
      foundWinner = true
      return res.json({
        status: "tie",
        tiedOptions: optionToEliminate.map((id) => ({
          optionId: id,
          name: optionsMap[id].name,
          voteCount: optionsMap[id].count,
        })),
        totalVotes,
      });
    }


    for (const optionId of optionToEliminate) {
      optionsMap[optionId].eliminated = true
    }
  }






  // return res.send(allBallots)
  // return res.send(ballots)
  //   [
  //     [
  //         7,
  //         8,
  //         9,
  //         10
  //     ],
  //     [
  //         10,
  //         9,
  //         8,
  //         7
  //     ]
  // ]
  // return res.send(options)
  return res.send(optionsMap)

  //  {
  //     "7": {
  //         "name": "Die Hard",
  //         "count": 0,
  //         "elimated": 0
  //     },
  //     "8": {
  //         "name": "Die Hard 2",
  //         "count": 0,
  //         "elimated": 0
  //     },
  //     "9": {
  //         "name": "Twilight",
  //         "count": 0,
  //         "elimated": 0
  //     },
  //     "10": {
  //         "name": "Spiderverse",
  //         "count": 0,
  //         "elimated": 0
  //     }
  // }
})

module.exports = router;
