const express = require("express");
const router = express.Router();
const testDbRouter = require("./test-db");

router.use("/test-db", testDbRouter);

module.exports = router;
//
