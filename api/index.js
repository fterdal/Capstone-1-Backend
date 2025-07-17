const express = require("express");
const router = express.Router();
const pollsRouter = require("./polls");;
const testDbRouter = require("./test-db");

router.use("/test-db", testDbRouter);
router.use("/polls", pollsRouter)

module.exports = router;
