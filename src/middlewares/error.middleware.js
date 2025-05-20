const { Sequelize } = require("sequelize");

// Xử lý lỗi chung
exports.handleError = (error, req, res, next) => {
  console.error("Lỗi:", error);

  // Xử lý lỗi trùng lặp
  if (error instanceof Sequelize.UniqueConstraintError) {
    const field = error.errors[0].path;
    return res.status(400).json({
      success: false,
      message: `${field === "email" ? "Email" : "Tên người dùng"} đã tồn tại`,
    });
  }

  // Xử lý lỗi validation
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu đầu vào không hợp lệ",
      errors: error.errors,
    });
  }

  // Xử lý lỗi không tìm thấy
  if (error.name === "NotFoundError") {
    return res.status(404).json({
      success: false,
      message: error.message || "Không tìm thấy tài nguyên",
    });
  }

  // Xử lý lỗi xác thực
  if (error.name === "AuthenticationError") {
    return res.status(401).json({
      success: false,
      message: error.message || "Không có quyền truy cập",
    });
  }

  // Xử lý lỗi phân quyền
  if (error.name === "AuthorizationError") {
    return res.status(403).json({
      success: false,
      message: error.message || "Không có quyền thực hiện thao tác này",
    });
  }

  // Xử lý lỗi mặc định
  res.status(500).json({
    success: false,
    message: "Đã xảy ra lỗi",
    error: error.message,
  });
};

// Helper tạo lỗi
exports.createError = (name, message, status = 500) => {
  const error = new Error(message);
  error.name = name;
  error.status = status;
  return error;
};
