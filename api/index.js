const express = require("express");
const router = express.Router();

const usersRouter = require("./users");
const pollsRouter = require("./polls");
const pollOptionsRouter = require("./pollOptions");
const ballotRouter = require("./ballots")

router.use("/users", usersRouter);
router.use("/polls", pollsRouter);
router.use("/pollOptions", pollOptionsRouter);
router.use("/ballots", ballotRouter);


module.exports = router;