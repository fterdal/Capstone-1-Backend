const express = require("express");
const router = express.Router();
const { Poll } = require("../database");

// Create poll 
router.post("/", async (req, res) => {
    try {
        const poll = req.body;

        if (!poll) {
            return res.status(400).json({ error: "Make sure to meet all constraints" });
        }

        const newPoll = await Poll.create(poll);
        res.status(201).json(newPoll)
    } catch (error) {
        res.status(500).json({
            error: "Failed to create poll",
            message: "Check that api end points match"
        })
    }
})

module.exports = router;