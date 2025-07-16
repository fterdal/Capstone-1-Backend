const express = require("express");
const router = express.Router();
const pollRouter = express.Router();
const testDbRouter = require("./test-db");

router.use("/test-db", testDbRouter);
router.use("/poll", pollRouter)

module.exports = router;
