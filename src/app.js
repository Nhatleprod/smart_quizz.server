require("dotenv").config();
const express = require("express");
const cors = require("cors");
const testRouter = require("./routes/test.router");
const { sequelize } = require("./config/db.config");

const app = express();

// Middleware
// app.use(cors());
app.use(express.json());

// Routes
app.use("/api/test", testRouter);

// Connect to database
sequelize
  .authenticate()
  .then(() => console.log("Kết nối DB thành công"))
  .catch((err) => console.error("Kết nối DB thất bại:", err));

module.exports = app;
