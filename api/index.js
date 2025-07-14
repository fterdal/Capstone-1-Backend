const express = require("express");
const router = express.Router();
const testDbRouter = require("./test-db");
// const usersRouter = require("./user");
const pollsRouter = require("./poll");
router.use("/Polls", pollsRouter);

router.use("/test-db", testDbRouter);

module.exports = router;
