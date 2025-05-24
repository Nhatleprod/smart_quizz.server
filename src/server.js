// server.js
const { startApp } = require("./app");

// Khởi động ứng dụng
startApp().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
