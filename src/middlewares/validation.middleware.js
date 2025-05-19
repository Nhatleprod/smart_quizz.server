// src/middlewares/validation.middleware.js
const { body, param, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

// Middleware để xử lý các kết quả validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu đầu vào không hợp lệ",
      errors: errors.array(),
    });
  }
  next();
};

// Validation chung cho username/email
const validateUsernameOrEmail = [
  body("username")
    .optional()
    .notEmpty()
    .withMessage("Username không được để trống"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Email không hợp lệ")
    .normalizeEmail(),

  body().custom((value, { req }) => {
    if (!req.body.username && !req.body.email) {
      throw new Error("Vui lòng cung cấp username hoặc email");
    }
    return true;
  }),
];

// Validation cho tạo tài khoản mới
const validateCreateAccount = [
  body("email").isEmail().withMessage("Email không hợp lệ").normalizeEmail(),

  body("username")
    .isLength({ min: 4 })
    .withMessage("Tên người dùng phải có ít nhất 4 ký tự")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự")
    .custom((value) => {
      // Kiểm tra ký tự đặc biệt (thêm dấu gạch dưới _)
      const specialChars = /[!@#$%^&*_]/;
      if (!specialChars.test(value)) {
        console.log("Mật khẩu không chứa ký tự đặc biệt:", value);
        console.log("Các ký tự đặc biệt được chấp nhận: !@#$%^&*_");
        throw new Error(
          "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*_)"
        );
      }

      // Kiểm tra các ký tự không hợp lệ (thêm dấu gạch dưới _)
      const invalidChars = /[^a-zA-Z0-9!@#$%^&*_]/;
      if (invalidChars.test(value)) {
        console.log("Mật khẩu chứa ký tự không hợp lệ:", value);
        console.log("Chỉ cho phép chữ cái, số và các ký tự đặc biệt !@#$%^&*_");
        throw new Error(
          "Mật khẩu chỉ được chứa chữ cái, số và các ký tự đặc biệt !@#$%^&*_"
        );
      }

      return true;
    }),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Vui lòng xác nhận mật khẩu")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Mật khẩu xác nhận không khớp");
      }
      return true;
    }),

  body("avatarURL")
    .optional()
    .isURL()
    .withMessage("URL ảnh đại diện không hợp lệ"),

  body("role")
    .optional()
    .isIn(["user", "admin", "moderator"])
    .withMessage(
      "Vai trò phải là một trong các giá trị: user, admin, moderator"
    ),

  handleValidationErrors,
];

// Validation cho cập nhật tài khoản
const validateUpdateAccount = [
  param("id").isUUID().withMessage("ID tài khoản không hợp lệ"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Email không hợp lệ")
    .normalizeEmail(),

  body("username")
    .optional()
    .isLength({ min: 4 })
    .withMessage("Tên người dùng phải có ít nhất 4 ký tự")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới"),

  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự")
    .matches(/^(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/)
    .withMessage("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*)"),

  body("avatarURL")
    .optional()
    .isURL()
    .withMessage("URL ảnh đại diện không hợp lệ"),

  body("role")
    .optional()
    .isIn(["user", "admin", "moderator"])
    .withMessage(
      "Vai trò phải là một trong các giá trị: user, admin, moderator"
    ),

  handleValidationErrors,
];

// Validation cho tìm kiếm và xóa tài khoản theo ID
const validateAccountId = [
  param("id")
    .exists()
    .withMessage("ID tài khoản là bắt buộc")
    .isUUID()
    .withMessage("ID tài khoản không hợp lệ"),

  (req, res, next) => {
    // Chỉ validate nếu có param id
    if (!req.params.id) {
      return next();
    }
    handleValidationErrors(req, res, next);
  },
];

// Validation cho việc cập nhật mật khẩu
const validateChangePassword = [
  body("oldPassword")
    .optional()
    .notEmpty()
    .withMessage("Vui lòng nhập mật khẩu cũ")
    .custom(async (value, { req }) => {
      if (value) {
        if (!req.body.newPassword || !req.body.confirmNewPassword) {
          throw new Error(
            "Vui lòng nhập đầy đủ mật khẩu mới và xác nhận mật khẩu"
          );
        }

        if (!req.account) {
          throw new Error("Không tìm thấy thông tin tài khoản");
        }

        const isMatch = await bcrypt.compare(value, req.account.passwordHash);
        if (!isMatch) {
          throw new Error("Mật khẩu cũ không đúng");
        }
      }
      return true;
    }),

  body("newPassword")
    .notEmpty()
    .withMessage("Vui lòng nhập mật khẩu mới")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu mới phải có ít nhất 6 ký tự")
    .custom((value) => {
      // Kiểm tra ký tự đặc biệt (thêm dấu gạch dưới _)
      const specialChars = /[!@#$%^&*_]/;
      if (!specialChars.test(value)) {
        console.log("Mật khẩu không chứa ký tự đặc biệt:", value);
        console.log("Các ký tự đặc biệt được chấp nhận: !@#$%^&*_");
        throw new Error(
          "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*_)"
        );
      }

      // Kiểm tra các ký tự không hợp lệ (thêm dấu gạch dưới _)
      const invalidChars = /[^a-zA-Z0-9!@#$%^&*_]/;
      if (invalidChars.test(value)) {
        console.log("Mật khẩu chứa ký tự không hợp lệ:", value);
        console.log("Chỉ cho phép chữ cái, số và các ký tự đặc biệt !@#$%^&*_");
        throw new Error(
          "Mật khẩu chỉ được chứa chữ cái, số và các ký tự đặc biệt !@#$%^&*_"
        );
      }

      return true;
    })
    .custom(async (value, { req }) => {
      // Kiểm tra mật khẩu mới không được trùng với mật khẩu cũ
      if (req.account) {
        const isSamePassword = await bcrypt.compare(
          value,
          req.account.passwordHash
        );
        if (isSamePassword) {
          throw new Error("Mật khẩu mới không được trùng với mật khẩu cũ");
        }
      }
      return true;
    }),

  body("confirmNewPassword")
    .notEmpty()
    .withMessage("Vui lòng xác nhận mật khẩu mới")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Mật khẩu xác nhận không khớp");
      }
      return true;
    }),

  handleValidationErrors,
];

// Validation cho đăng nhập
const validateLogin = [
  body("username").notEmpty().withMessage("Vui lòng nhập tên đăng nhập"),

  body("password")
    .notEmpty()
    .withMessage("Vui lòng nhập mật khẩu")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự")
    .matches(/^(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/)
    .withMessage("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*)"),

  handleValidationErrors,
];

// Validation cho việc kiểm tra tài khoản (quên mật khẩu)
const validateCheckAccount = [
  ...validateUsernameOrEmail,
  handleValidationErrors,
];

// Validation cho reset password
const validateResetPassword = [
  body("email")
    .notEmpty()
    .withMessage("Vui lòng nhập email")
    .isEmail()
    .withMessage("Email không hợp lệ")
    .normalizeEmail(),

  handleValidationErrors,
];

// Export tất cả các middleware
module.exports = {
  validateCreateAccount,
  validateUpdateAccount,
  validateAccountId,
  validateChangePassword,
  validateLogin,
  validateCheckAccount,
  validateResetPassword,
};
