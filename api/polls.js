const express = require("express");
const router = express.Router();
const { Poll, PollOption } = require("../database");
const { authenticateJWT } = require("../auth");

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
            }
        })
        const specialDelivery = {
            message: draftPolls.length === 0
                ? "There no polls to display"
                : "Polls successfully retrived",
            polls: draftPolls, // polls is an array of objects
        }

        specialDelivery.polls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        specialDelivery.polls.map((poll) => {
            console.log(poll.createdAt)
        })

        res.status(200).json(specialDelivery);
    } catch (error) {
        res.status(500).json({ error: "Failed to get drafted polls" })
    }
})


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
                userId: userId
            },
            include: { model: PollOption }
        })

        if (!poll) {
            return res.status(404).json({ error: "No polls found" })
        }
        res.json(poll)

    } catch (error) {
        console.error("Error fetching poll:", error);
        res.status(500).json({ error: "Failed to get poll by ID" });
    }
});



// Create polls---------------------------
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
            return res.status(201).json({
                message: "Poll and options created",
                poll: newPoll
            });
        }
        return res.json(newPoll)
    } catch (error) {
        res.status(500).json({
            error: "Failed to create poll",
            message: "Check that API fields and data are correct"
        })
    }
});



//Edit polls--------------------
router.patch("/:pollId", authenticateJWT, async (req, res) => {
    const userId = req.user.id
    const poll = req.body;
    const { title, description, deadline, status, options = [] } = req.body;
    const newBody = {
        title,
        description,
        deadline,
        status,
    }
    const { pollId } = req.params;

    try {
        const updatePoll = await Poll.findByPk(pollId);

        if (!updatePoll) {
            return res.status(404).json({ error: "poll not found" })
        } else if (updatePoll.userId !== userId) {
            return res.status(403).json({ error: "poll does not belong to this user" })
        };


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

            return res.json(newBody)
        };

        if (updatePoll.status === "published") {
            const updateDeadline = await updatePoll.update({ deadline });
            return res.json(updateDeadline);
        }
        return res.status(400).json({ error: "Invalid poll status string or update not allowed" })
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({
            error: "Failed to update poll",
            message: "Only deadline can be edited when poll is published",
        })
    }

});

//delete draft poll-------------------------
router.delete("/:id", authenticateJWT, async (req, res) => {
    try {
        const pollId = req.params.id;
        const userId = req.user.id;

        const poll = await Poll.findByPk(pollId);

        if (!poll) { res.status(404).json({ error: "Poll not found" }) };

        if (poll.userId !== userId) { res.status(401).json({ error: "Unauthorized action: You do not own this poll" }) };

        if (poll.status !== "draft") { res.status(401).json({ error: "Unauthorized action: Only draft polls can be deleted" }) };

        await poll.destroy();

        res.json({ message: "Draft poll deleted successfully" });

    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete draft poll" });
    }
});

module.exports = router;