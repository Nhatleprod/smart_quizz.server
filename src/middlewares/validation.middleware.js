// src/middlewares/validation.middleware.js
const { body, param, validationResult } = require('express-validator');

// Middleware để xử lý các kết quả validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu đầu vào không hợp lệ',
      errors: errors.array()
    });
  }
  next();
};

// Validation cho tạo tài khoản mới
exports.validateCreateAccount = [
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  body('username')
    .isLength({ min: 4 })
    .withMessage('Tên người dùng phải có ít nhất 4 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/\d/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 số'),
  
  body('avatarURL')
    .optional()
    .isURL()
    .withMessage('URL ảnh đại diện không hợp lệ'),
  
  body('role')
    .optional()
    .isIn(['user', 'admin', 'moderator'])
    .withMessage('Vai trò phải là một trong các giá trị: user, admin, moderator'),
  
  handleValidationErrors
];

// Validation cho cập nhật tài khoản
exports.validateUpdateAccount = [
  param('id')
    .isUUID()
    .withMessage('ID tài khoản không hợp lệ'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  body('username')
    .optional()
    .isLength({ min: 4 })
    .withMessage('Tên người dùng phải có ít nhất 4 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới'),
  
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/\d/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 số'),
  
  body('avatarURL')
    .optional()
    .isURL()
    .withMessage('URL ảnh đại diện không hợp lệ'),
  
  body('role')
    .optional()
    .isIn(['user', 'admin', 'moderator'])
    .withMessage('Vai trò phải là một trong các giá trị: user, admin, moderator'),
  
  handleValidationErrors
];

// Validation cho tìm kiếm và xóa tài khoản theo ID
exports.validateAccountId = [
  param('id')
    .isUUID()
    .withMessage('ID tài khoản không hợp lệ'),
  
  handleValidationErrors
];

// Validation cho việc cập nhật mật khẩu
exports.validateChangePassword = [
  body('oldPassword').notEmpty().withMessage('Vui lòng nhập mật khẩu cũ'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
    .matches(/\d/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 số'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];