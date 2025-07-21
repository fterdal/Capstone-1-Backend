const express = require('express');
const { authenticateJWT, requireAdmin } = require('../auth');
const router = express.Router();

router.get(
  '/users',
  authenticateJWT,
  requireAdmin,
  (req, res) => {
    res.send({ secretStats: { /* … */ } });
  }
);

module.exports = router;