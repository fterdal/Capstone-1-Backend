const express = require("express");
const router = express.Router();
const { PollOption } = require("../database");

router.get("/", async (req, res) => {
  try {
    const options = await PollOption.findAll();
    console.log(`Found ${options.length} poll options`);
    res.status(200).send(options);
  } catch (error) {
    console.error("Error fetching poll options:", error);
    res.status(500).json({
      error: "Failed to fetch poll options",
      message: "Check your database connection",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const option = await PollOption.findByPk(req.params.id);
    if (!option) {
      return res.status(404).json({ error: "Poll option not found" });
    }
    res.status(200).send(option);
  } catch (error) {
    console.error("Error fetching poll option:", error);
    res.status(500).json({ error: "Failed to fetch poll option by id" });
  }
});

router.post("/", async (req, res) => {
  try {
    const option = await PollOption.create(req.body);
    res.status(201).send(option);
  } catch (error) {
    console.error("Error creating poll option:", error);
    res.status(500).json({ error: "Failed to create poll option" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const option = await PollOption.findByPk(req.params.id);
    if (!option) {
      return res.status(404).json({ error: "Poll option not found" });
    }
    await option.destroy();
    res.status(200).json({ message: "Poll option deleted successfully" });
  } catch (error) {
    console.error("Error deleting poll option:", error);
    res.status(500).json({ error: "Failed to delete poll option" });
  }
});

module.exports = router;