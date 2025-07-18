const express = require("express");
const router = express.Router();

const testDbRouter = require("./test-db");
const ballotsRouter = require("./ballot");
const usersRouter = require("./user");
const pollsRouter = require("./poll");

router.use("/Polls", pollsRouter);
router.use("/ballots", ballotsRouter); 
router.use("/users", usersRouter);
router.use("/test-db", testDbRouter);

module.exports = router;

