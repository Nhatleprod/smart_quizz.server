require("dotenv").config();

// Import các dependencies
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
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
const setupRoutes = () => {
  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Root endpoint
  app.get("/", (req, res) => {
    res.json({
      message: "SmartQuiz API",
      version: "1.0.0",
      documentation: "/api/docs",
    });
  });

  // API routes - Đặt sau các routes khác
  if (typeof apiRouter === "function") {
    app.use("/api", apiRouter);
  } else {
    console.error("apiRouter is not a middleware function:", apiRouter);
    process.exit(1);
  }

  // 404 handler - Đặt sau tất cả các routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
    });
  });

  // Error handler - Đặt cuối cùng
  if (typeof errorHandler === "function") {
    app.use(errorHandler);
  } else {
    console.error("errorHandler is not a middleware function:", errorHandler);
    process.exit(1);
  }
};

// Database connection
const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

// Khởi động ứng dụng
const startApp = async () => {
  try {
    // Setup middleware trước
    setupMiddleware();

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
