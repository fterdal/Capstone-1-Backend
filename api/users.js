const express = require("express");
const router = express.Router();
const { User, Poll, Ballot } = require("../database");

//get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.findAll({ include: [Poll, Ballot] });
    res.status(200).send(users);
  } catch (error) {
    console.error("Error fetching users: ", error);
    res.status(500).send("Error fetching users");
  }
});

//get a user by id
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [Poll, Ballot]
    });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).send(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).send("Error fetching user");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete a user" });
  }
});

//create a user
router.post("/", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const passwordHash = User.hashPassword(password);

    const newUser = { username, email, passwordHash };

    const savedUser = await User.create(newUser);

    res.status(201).send(savedUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send("Error creating user");
  }
});

module.exports = router;