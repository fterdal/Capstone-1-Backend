const express = require("express");
const router = express.Router();

const usersRouter = require("./users");
const pollsRouter = require("./polls");

router.use("/users", usersRouter);
router.use("/polls", pollsRouter); 

module.exports = router;