const express = require("express");
const router = express.Router();
const pollRouter = require("./polls");
const testDbRouter = require("./test-db");

router.use("/test-db", testDbRouter);
router.use("/polls", pollRouter)

module.exports = router;
