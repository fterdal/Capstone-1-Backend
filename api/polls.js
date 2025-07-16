const express = require("express");
const router = express.Router();
const { Poll } = require("../database");
const { authenticateJWT } = require("../auth")


// Create poll 
router.post("/", authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id
        const pollData = req.body;

        if (!pollData) {
            return res.status(400).json({ error: "Make sure to meet all constraints" });
        }

        const newPoll = await Poll.create({
            ...pollData,
            userId
        });
        res.status(201).json(newPoll)
    } catch (error) {
        res.status(500).json({
            error: "Failed to create poll",
            message: "Check that api end points match"
        })
    }
})

//delete draft poll

router.delete("/:id",authenticateJWT, async (req, res) => {
    try{
        const pollId = req.params.id;
        const userId = req.user.id;

        const poll = await Poll.findByPk(pollId);

        if (!poll) {res.status(404).json({error: "Poll not found"})};

        if (poll.userId !== userId) {res.status(401).json({error: "Unauthorized action"})};

    }
    catch (error) {

    }
});

module.exports = router;