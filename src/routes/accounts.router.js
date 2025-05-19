// src/routes/accounts.router.js
const express = require("express");
const router = express.Router();

// Controllers
const accountsController = require("../controllers/accounts.controller");

// Middlewares
const {
  validateCreateAccount,
  validateUpdateAccount,
  validateAccountId,
  validateChangePassword,
  validateLogin,
  validateCheckAccount,
  validateResetPassword,
} = require("../middlewares/validation.middleware");
const { hashPassword } = require("../middlewares/hashPassword.middleware");
const {
  authenticateById,
  authenticateByCredentials,
  checkRole,
} = require("../middlewares/auth.middleware");

// Debug middleware
const debugMiddleware = (req, res, next) => {
  console.log("Request URL:", req.originalUrl);
  console.log("Request Method:", req.method);
  console.log("Request Body:", req.body);
  console.log("Request Params:", req.params);
  next();
};

// Áp dụng debug middleware cho tất cả routes
router.use(debugMiddleware);

// Routes không có param
// Đăng nhập
router.post(
  "/login",
  validateLogin,
  authenticateByCredentials,
  accountsController.login
);

// Tạo tài khoản mới
router.post(
  "/",
  validateCreateAccount,
  hashPassword,
  accountsController.createAccount
);

// Tìm kiếm tài khoản theo username hoặc email
router.post("/search", accountsController.findAccountByUsernameOrEmail);

// Lấy tất cả tài khoản (chỉ admin)
router.get(
  "/",
  authenticateByCredentials,
  checkRole(["admin"]),
  accountsController.getAllAccounts
);

// Quên mật khẩu - Kiểm tra tài khoản
router.post(
  "/forgot-password/check",
  validateCheckAccount,
  authenticateByCredentials,
  accountsController.checkAccountExists
);

// Tạo router con cho các routes có param :id
const accountByIdRouter = express.Router();

// Middleware kiểm tra ID tài khoản - Chỉ áp dụng cho các routes có param id
accountByIdRouter.use((req, res, next) => {
  // Kiểm tra xem có param id không
  if (!req.params.id) {
    return next();
  }

  // Validate UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu đầu vào không hợp lệ",
      errors: [
        {
          type: "field",
          msg: "ID tài khoản không hợp lệ",
          path: "id",
          location: "params",
        },
      ],
    });
  }
  next();
});

// Lấy tài khoản theo ID - Public route
accountByIdRouter.get("/", accountsController.getAccountById);

// Cập nhật tài khoản - Cần authenticate
accountByIdRouter.put(
  "/",
  authenticateById,
  validateUpdateAccount,
  accountsController.updateAccount
);

// Cập nhật mật khẩu - Cần authenticate
accountByIdRouter.put(
  "/password",
  authenticateById,
  validateChangePassword,
  hashPassword,
  accountsController.changePassword
);

// Xóa tài khoản - Cần authenticate
accountByIdRouter.delete(
  "/",
  authenticateById,
  accountsController.deleteAccount
);

// Mount router con vào path /:id
router.use("/:id", accountByIdRouter);

module.exports = router;
