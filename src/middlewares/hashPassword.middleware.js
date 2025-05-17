// src/middlewares/hashPassword.middleware.js
const bcrypt = require('bcryptjs');

/**
 * Middleware để hash mật khẩu trước khi lưu vào DB
 * Chuyển đổi từ password thành passwordHash
 */
exports.hashPassword = async (req, res, next) => {
  try {
    // Nếu có password trong request body
    if (req.body.password) {
      // Tạo salt và hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      
      // Thay thế password bằng passwordHash
      req.body.passwordHash = hashedPassword;
      
      // Xóa password khỏi request body vì chúng ta không lưu plain password
      delete req.body.password;
    }
    
    next();
  } catch (error) {
    console.error('Lỗi khi hash password:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xử lý mật khẩu',
      error: error.message
    });
  }
};