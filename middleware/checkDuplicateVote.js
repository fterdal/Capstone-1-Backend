const { Vote } = require("../database");
const {Op} = require("sequelize"); //operator to specify multiple conditions

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
        const ipAddress = req.ip;
        //check if guest user already voted
        const existingGuestVote = await Vote.findOne({
          where: {
            pollId: pollId,
            [Op.or]: [
              { voterToken: guestUser },
              { ipAddress: ipAddress }
            ],
          },
        });
        if (existingGuestVote) {
          return res
            .status(409)
            .json({ error: "You have already voted on this poll." });
        }
    }
    return next(); // proceed to the next middleware or route handler
  } catch (error) {
    console.error("Duplicate vote check failed:", error);
    res.status(500).json({ error: "Server error checking vote." });
  }
};

module.exports = checkDuplicateVote;
