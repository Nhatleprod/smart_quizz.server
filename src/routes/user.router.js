const express = require("express");
const router = express.Router();
const { models } = require("./config/db.config");

const User = models.users;

router.get("/users", async (req, res) => {
  try {
    const allUsers = await User.findAll();
    res.json(allUsers);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error when get data", error: err.message });
  }
});

module.exports = router;
