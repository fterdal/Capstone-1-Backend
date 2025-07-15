const express = require("express");
const router = express.Router();

const usersRouter = require("./users");
const pollsRouter = require("./polls");
const pollOptionsRouter = require("./pollOptions");

router.use("/users", usersRouter);
router.use("/polls", pollsRouter);
router.use("/pollOptions", pollOptionsRouter);

module.exports = router;