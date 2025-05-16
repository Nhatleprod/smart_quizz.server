const express = require("express");
const router = express.Router();

// Route test: GET /
router.get("/", (req, res) => {
  res.json({ message: "Test ok!" });
});

module.exports = router;
