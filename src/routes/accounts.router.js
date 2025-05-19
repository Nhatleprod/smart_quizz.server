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
  authenticateAccount,
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

// ===== PUBLIC ROUTES (Không cần authenticate) =====

// Đăng nhập
router.post(
  "/login",
  validateLogin,
  authenticateByCredentials,
  accountsController.login
);

// Refresh token
router.post(
  "/refresh-token",
  (req, res, next) => {
    console.log("Processing refresh token request");
    next();
  },
  accountsController.refreshToken
);

// Tạo tài khoản mới
router.post(
  "/",
  validateCreateAccount,
  hashPassword,
  accountsController.createAccount
);


// Middleware xác thực cho các routes được bảo vệ
const protectedRoutes = express.Router();
protectedRoutes.use(authenticateAccount);

// Tìm kiếm tài khoản theo username hoặc email
protectedRoutes.post("/search", accountsController.findAccountByUsernameOrEmail);

// Lấy tất cả tài khoản (chỉ admin)
protectedRoutes.get(
  "/",
  checkRole(["admin"]),
  accountsController.getAllAccounts
);

// Quên mật khẩu - Kiểm tra tài khoản
protectedRoutes.post(
  "/forgot-password/check",
  validateCheckAccount,
  authenticateByCredentials,
  accountsController.checkAccountExists
);

// Mount protected routes
router.use(protectedRoutes);

// ===== ROUTES WITH ID PARAM =====

// Tạo router con cho các routes có param :id
const accountByIdRouter = express.Router();

// Middleware kiểm tra ID tài khoản
accountByIdRouter.use((req, res, next) => {
  if (!req.params.id) return next();

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu đầu vào không hợp lệ",
      errors: [{
        type: "field",
        msg: "ID tài khoản không hợp lệ",
        path: "id",
        location: "params",
      }],
    });
  }
  next();
});

// Áp dụng authenticate cho các routes có ID
accountByIdRouter.use(authenticateAccount);

// Lấy tài khoản theo ID
accountByIdRouter.get("/", accountsController.getAccountById);

// Cập nhật tài khoản
accountByIdRouter.put(
  "/",
  (req, res, next) => {
    if (req.account.id !== req.params.id && req.account.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền cập nhật tài khoản này"
      });
    }
    next();
  },
  validateUpdateAccount,
  accountsController.updateAccount
);

// Cập nhật mật khẩu
accountByIdRouter.put(
  "/password",
  (req, res, next) => {
    if (req.account.id !== req.params.id && req.account.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền thay đổi mật khẩu tài khoản này"
      });
    }
    next();
  },
  validateChangePassword,
  hashPassword,
  accountsController.changePassword
);

// Xóa tài khoản
accountByIdRouter.delete(
  "/",
  (req, res, next) => {
    if (req.account.id !== req.params.id && req.account.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa tài khoản này"
      });
    }
    next();
  },
  accountsController.deleteAccount
);

// Mount router con vào path /:id
router.use("/:id", accountByIdRouter);

module.exports = router;
