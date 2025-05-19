require("dotenv").config();

// Import các dependencies
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Import routes
const accountsRouter = require("./routes/accounts.router");
const usersRouter = require("./routes/users.router");
const adminsRouter = require("./routes/admins.router");
const groupStudyRouter = require("./routes/group_study.router");
const groupMembersRouter = require("./routes/group_members.router");
const examsRouter = require("./routes/exams.router");
const questionsRouter = require("./routes/questions.router");
const testRouter = require("./routes/test.router");

const { sequelize } = require("./config/db.config");
const { errorHandler } = require("./middlewares");

// Import routes
const apiRouter = require("./routes");

// Khởi tạo app
const app = express();

// Middleware cơ bản
const setupMiddleware = () => {
  // Security middleware
  app.use(helmet());
  app.use(cors());

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging middleware
  if (process.env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
  }
};

// Routes
app.use("/api/test", testRouter);
app.use("/api/accounts", accountsRouter);
app.use("/api/users", usersRouter);
app.use("/api/admins", adminsRouter);
app.use("/api/group_study", groupStudyRouter);
app.use("/api/group_members", groupMembersRouter);
app.use("/api/exams", examsRouter);
app.use("/api/questions", questionsRouter);
app.get("/", (req, res) => {
  res.send("API đang chạy");
});

    // Connect to database
    await connectDatabase();

    // Setup routes sau khi đã kết nối database
    setupRoutes();

    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    return app;
  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
};

// Export app và hàm startApp
module.exports = { app, startApp };
