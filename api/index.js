const express = require("express");
const router = express.Router();

const usersRouter = require("./users");
const pollsRouter = require("./polls");
const pollOptionsRouter = require("./pollOptions");
const ballotRouter = require("./ballots");
const adminRouter = require("./admins")

router.use("/users", usersRouter);
router.use("/polls", pollsRouter);
router.use("/pollOptions", pollOptionsRouter);
router.use("/ballots", ballotRouter);
router.use("/admin", adminRouter)

module.exports = router;