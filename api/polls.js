const express = require("express");
const router = express.Router();
const { authenticateJWT, requireAuth, requireAdmin } = require("../auth");
const { Poll, PollOption, Ballot, BallotRanking, User, PollAllowedUser, PollResult, PollResultValue, PollViewPermission, PollVotePermission, db } = require("../database");
const { checkPollViewPermission, checkPollVotePermission } = require("../services/pollPermissions");
const { Op } = require("sequelize");

router.use(authenticateJWT);

router.get("/", async (req, res) => {
  try {
    const userId = req.user?.id; 
    
    const polls = await Poll.findAll({
      include: [
        {
          model: PollOption,
          as: "PollOptions", 
          required: false
        },
        {
          model: Ballot,
          required: false,
          include: [
            {
              model: BallotRanking,
              required: false
            }
          ],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "username", "imageUrl"],
          required: false
        }
      ],
    });

    const accessiblePolls = [];
    
    for (const poll of polls) {
      const canView = await checkPollViewPermission(poll, userId);
      if (canView) {
        accessiblePolls.push(poll);
      }
    }

    res.status(200).send(accessiblePolls);
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
    const userId = req.user?.id;
    
    const poll = await Poll.findByPk(req.params.id, {
      include: [
        {
          model: PollOption,
          as: "PollOptions", 
          required: false,
          order: [['position', 'ASC']]
        },
        {
          model: Ballot,
          required: false,
          include: [
            {
              model: BallotRanking,
              required: false,
              include: [
                {
                  model: PollOption,
                  required: false
                }
              ]
            }
          ],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "username", "imageUrl"],
          required: false
        }
      ],
    });

    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    const canView = await checkPollViewPermission(poll, userId);
    if (!canView) {
      return res.status(403).json({ 
        error: "Access denied",
        message: "You don't have permission to view this poll",
        requiresLogin: !userId && poll.viewRestriction !== "public"
      });
    }

    const canVote = await checkPollVotePermission(poll, userId);
    const pollData = poll.toJSON();
    
    if (!pollData.PollOptions && pollData.pollOptions) {
      pollData.PollOptions = pollData.pollOptions;
      delete pollData.pollOptions;
    }
    
    pollData.permissions = {
      canView: true,
      canVote
    };
    
    res.status(200).json(pollData);
  } catch (error) {
    console.error("Error fetching poll by ID:", error);
    res.status(500).json({ error: "Failed to fetch poll by id" });
  }
});

router.get("/search/users", async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const users = await User.findAll({
      where: {
        username: {
          [Op.iLike]: `%${q}%`
        }
      },
      attributes: ["id", "username", "imageUrl"],
      limit: 10
    });

    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      allowAnonymous,
      status, 
      endAt,
      viewRestriction,
      voteRestriction,
      customViewUsers,
      customVoteUsers,
      pollOptions,
    } = req.body;

    const userId = req.user.id;

    console.log("Creating poll with data:", req.body);

    const result = await db.transaction(async (transaction) => {
      const poll = await Poll.create({
        creator_id: userId,
        title: title.trim(),
        description: description ? description.trim() : null,
        allowAnonymous: allowAnonymous || false,
        status: status || "draft", 
        endAt: endAt ? new Date(endAt) : null,
        viewRestriction: viewRestriction || "public",
        voteRestriction: voteRestriction || "public",
        isActive: true
      }, { transaction });

      if (pollOptions && Array.isArray(pollOptions) && pollOptions.length > 0) {
        const optionsData = pollOptions.map(option => ({
          poll_id: poll.id,
          text: option.text.trim(),
          position: option.position || 1
        }));

        await PollOption.bulkCreate(optionsData, { transaction });
        console.log(`Created ${optionsData.length} options for poll ${poll.id}`);
      }

      if (viewRestriction === "custom" && customViewUsers && customViewUsers.length > 0) {
        const viewPermissions = customViewUsers.map(userId => ({
          poll_id: poll.id,
          user_id: userId
        }));
        await PollViewPermission.bulkCreate(viewPermissions, { transaction });
      }

      if (voteRestriction === "custom" && customVoteUsers && customVoteUsers.length > 0) {
        const votePermissions = customVoteUsers.map(userId => ({
          poll_id: poll.id,
          user_id: userId
        }));
        await PollVotePermission.bulkCreate(votePermissions, { transaction });
      }

      return poll;
    });

    res.status(201).json({
      message: `Poll ${status === 'draft' ? 'saved as draft' : 'published'} successfully`,
      poll: result,
      id: result.id
    });

  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).json({ 
      error: "Failed to create poll",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const pollId = req.params.id;
    const userId = req.user.id;
    
    const poll = await Poll.findByPk(pollId);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }
    if (poll.creator_id !== userId) {
      return res.status(403).json({ error: "You can only edit your own polls" });
    }

    const {
      title,
      description,
      allowAnonymous,
      status,
      endAt,
      viewRestriction,
      voteRestriction,
      customViewUsers,
      customVoteUsers,
      pollOptions
    } = req.body;

    console.log("Updating poll with data:", req.body);

    const result = await db.transaction(async (transaction) => {
      await poll.update({
        title: title ? title.trim() : poll.title,
        description: description !== undefined ? (description ? description.trim() : null) : poll.description,
        allowAnonymous: allowAnonymous !== undefined ? allowAnonymous : poll.allowAnonymous,
        status: status || poll.status,
        endAt: endAt !== undefined ? (endAt ? new Date(endAt) : null) : poll.endAt,
        viewRestriction: viewRestriction || poll.viewRestriction,
        voteRestriction: voteRestriction || poll.voteRestriction,
      }, { transaction });

      if (pollOptions && Array.isArray(pollOptions)) {
        await PollOption.destroy({ 
          where: { poll_id: pollId },
          transaction
        });

        if (pollOptions.length > 0) {
          const optionsData = pollOptions.map((option, index) => ({
            poll_id: pollId,
            text: option.text.trim(),
            position: option.position || index + 1,
          }));

          await PollOption.bulkCreate(optionsData, { transaction });
        }
      }

      if (viewRestriction === "custom") {
        await PollViewPermission.destroy({
          where: { poll_id: pollId },
          transaction
        });

        if (customViewUsers && Array.isArray(customViewUsers) && customViewUsers.length > 0) {
          const viewPermissions = customViewUsers.map(userId => ({
            poll_id: pollId,
            user_id: userId
          }));
          await PollViewPermission.bulkCreate(viewPermissions, { transaction });
        }
      } else {
        await PollViewPermission.destroy({
          where: { poll_id: pollId },
          transaction
        });
      }

      if (voteRestriction === "custom") {
        await PollVotePermission.destroy({
          where: { poll_id: pollId },
          transaction
        });

        if (customVoteUsers && Array.isArray(customVoteUsers) && customVoteUsers.length > 0) {
          const votePermissions = customVoteUsers.map(userId => ({
            poll_id: pollId,
            user_id: userId
          }));
          await PollVotePermission.bulkCreate(votePermissions, { transaction });
        }
      } else {
        await PollVotePermission.destroy({
          where: { poll_id: pollId },
          transaction
        });
      }

      return poll;
    });

    const updatedPoll = await Poll.findByPk(pollId, {
      include: [
        {
          model: PollOption,
          as: "PollOptions"
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "username", "imageUrl"]
        }
      ],
    });

    res.status(200).json({
      message: `Poll ${status === 'draft' ? 'saved as draft' : 'updated'} successfully`,
      poll: updatedPoll
    });

  } catch (error) {
    console.error("Error updating poll:", error);
    res.status(500).json({ 
      error: "Failed to update poll",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const poll = await Poll.findByPk(req.params.id);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    await poll.destroy();
    res.status(200).json({ message: "Poll deleted successfully" });
  } catch (error) {
    console.error("Error deleting poll:", error);
    res.status(500).json({ error: "Failed to delete poll" });
  }
});

router.get("/:pollId/results", async (req, res) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findByPk(pollId, {
      include: [
        {
          model: PollOption,
          include: [
            {
              model: PollResultValue,
              include: [
                {
                  model: PollResult,
                  where: { poll_id: pollId },
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });

    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    res.status(200).send(poll);
  } catch (error) {
    console.error("Error fetching poll results:", error);
    res.status(500).json({ error: "Failed to fetch poll results" });
  }
});

router.post("/:pollId/vote", requireAuth, async (req, res) => {
  try {
    const { pollId } = req.params;
    const { rankings } = req.body;
    const userId = req.user.id;

    const poll = await Poll.findByPk(pollId, {
      include: [{ model: PollOption, as: "PollOptions" }]
    });

    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    const canVote = await checkPollVotePermission(poll, userId);
    if (!canVote) {
      return res.status(403).json({ 
        error: "Access denied",
        message: "You don't have permission to vote on this poll"
      });
    }

    if (poll.endAt && new Date() > new Date(poll.endAt)) {
      return res.status(400).json({ error: "Poll has ended" });
    }

    if (userId) {
      const existingBallot = await Ballot.findOne({
        where: { poll_id: pollId, user_id: userId }
      });

      if (existingBallot) {
        return res.status(400).json({ error: "You have already voted on this poll" });
      }
    }

    const ballot = await Ballot.create({
      poll_id: pollId,
      user_id: userId, 
    });

    if (rankings && Array.isArray(rankings)) {
      const ballotRankings = rankings.map(ranking => ({
        ballot_id: ballot.id,
        option_id: ranking.option_id,
        rank: ranking.rank,
      }));

      await BallotRanking.bulkCreate(ballotRankings);
    }

    res.status(201).json({ message: "Vote recorded successfully", ballot_id: ballot.id });
  } catch (error) {
    console.error("Error recording vote:", error);
    res.status(500).json({ error: "Failed to record vote" });
  }
});

router.get("/:pollId/my-ballot", requireAuth, async (req, res) => {
  try {
    const { pollId } = req.params;
    const userId = req.user.id;

    const ballot = await Ballot.findOne({
      where: { poll_id: pollId, user_id: userId },
      include: [
        {
          model: BallotRanking,
          include: [{ model: PollOption }]
        },
      ],
    });

    if (!ballot) {
      return res.status(404).json({ error: "No ballot found for this poll" });
    }

    res.status(200).send(ballot);
  } catch (error) {
    console.error("Error fetching user ballot:", error);
    res.status(500).json({ error: "Failed to fetch ballot" });
  }
});

router.post("/:pollId/allowed-users", async (req, res) => {
  try {
    const { pollId } = req.params;
    const { userIds } = req.body;

    const poll = await Poll.findByPk(pollId);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    if (userIds && Array.isArray(userIds)) {
      const allowedUsers = userIds.map(userId => ({
        poll_id: pollId,
        user_id: userId,
      }));

      await PollAllowedUser.bulkCreate(allowedUsers, {
        ignoreDuplicates: true,
      });
    }

    res.status(201).json({ message: "Users added to allowed list" });
  } catch (error) {
    console.error("Error adding allowed users:", error);
    res.status(500).json({ error: "Failed to add allowed users" });
  }
});

router.get("/:pollId/allowed-users", async (req, res) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findByPk(pollId, {
      include: [
        {
          model: User,
          as: "allowedUsers",
          attributes: ["id", "username", "imageUrl"],
        },
      ],
    });

    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    res.status(200).send(poll.allowedUsers);
  } catch (error) {
    console.error("Error fetching allowed users:", error);
    res.status(500).json({ error: "Failed to fetch allowed users" });
  }
});

router.get("/:id/permissions", requireAuth, async (req, res) => {
  try {
    const pollId = req.params.id;
    
    const poll = await Poll.findByPk(pollId);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    const viewPermissions = await PollViewPermission.findAll({
      where: { poll_id: pollId },
      include: [{
        model: User,
        attributes: ["id", "username", "imageUrl"]
      }]
    });

    const votePermissions = await PollVotePermission.findAll({
      where: { poll_id: pollId },
      include: [{
        model: User,
        attributes: ["id", "username", "imageUrl"]
      }]
    });

    res.json({
      customViewUsers: viewPermissions.map(p => p.User),
      customVoteUsers: votePermissions.map(p => p.User)
    });

  } catch (error) {
    console.error("Error fetching poll permissions:", error);
    res.status(500).json({ error: "Failed to fetch poll permissions" });
  }
});

module.exports = router;