require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Import routes
const accountsRouter = require("./routes/accounts.router");
const usersRouter = require("./routes/users.router");
const adminsRouter = require("./routes/admins.router");
const testRouter = require("./routes/test.router");

const { sequelize } = require("./config/db.config");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api/test", testRouter);
app.use("/api/accounts", accountsRouter);
app.use("/api/users", usersRouter);
app.use("/api/admins", adminsRouter);
app.get("/", (req, res) => {
  res.send("API đang chạy");
});

// Connect to database
sequelize
  .authenticate()
  .then(() => console.log("Kết nối DB thành công"))
  .catch((err) => console.error("Kết nối DB thất bại:", err));

module.exports = app;
