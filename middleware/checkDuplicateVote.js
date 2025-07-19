const { Vote } = require("../database");

const checkDuplicateVote = async (req, res, next) => {
  const userId = req.user.id;
  const pollId = req.body.pollId;

  try {
    if (userId) {
      //check if user already voted
      const existingVote = await Vote.findOne({
        where: {
          userId: userId,
          pollId: pollId,
        },
      });

      if (existingVote) {
        return res
          .status(409)
          .json({ error: "You have already voted on this poll." });
      }
    }
    else {
        const guestUser = req.body.voterToken;
        //check if guest user already voted
        const existingGuestVote = await Vote.findOne({
          where: {
            voterToken: guestUser,
            pollId: pollId,
          },
        });
        if (existingGuestVote) {
          return res
            .status(409)
            .json({ error: "You have already voted on this poll." });
        }
    }
  } catch (error) {}
};

module.exports = checkDuplicateVote;
