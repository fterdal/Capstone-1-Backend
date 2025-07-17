const express = require("express");
const router = express.Router();
const { Poll, PollOption } = require("../database");
const { authenticateJWT } = require("../auth")


// Create polls
router.post("/", authenticateJWT, async (req, res) => {
    const userId = req.user.id
    const { title, description, deadline, status, options = [] } = req.body;

    if (status === "published" && options.length < 2) {
        res.status(400).json({
            error: " 2 options are requires to  publish a poll"
        })
    };


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
            const formattedOptions = options.map(text => ({
                optionText: text,
                pollId: newPoll.id
            }));

            await PollOption.bulkCreate(formattedOptions)
            res.status(201).json({
                message: "Poll and options created",
                poll: newPoll
            });
        }
    } catch (error) {
        res.status(500).json({
            error: "Failed to create poll",
            message: "Check that API fields and data are correct"
        })
    }
})


module.exports = router;