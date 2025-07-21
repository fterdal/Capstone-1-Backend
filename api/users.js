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
      include: [Poll, Ballot],
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

router.patch("/:id", async(req,res) => {
  try{
    const{ password, ...userData } = req.body;

    const existingUser= await User.findByPk(req.params.id);
    if(!existingUser) {
      return res.status(404).send("User not found");
    }

    const updateData = {...userData};

    if(password){
      updateData.passwordHash = User.hashPassword(password);
    }

    const [updatedRows] = await User.update(updateData, {
      where: {id: req.params.id},
    });

    if (updatedRows === 0){
      return res.status(400).send("No changes made to the user");
    }

    const updatedUser = await User.findByPk(req.params.id,{
      include:[Poll, Ballot],
      attributes: {exclude: ["passwordHash"]}
    });

    res.status(200).send(updatedUser);
  }catch (error){
    console.error("Error updating User: ", error);
    res.status(500).send("Error User");
  }
})

module.exports = router;
