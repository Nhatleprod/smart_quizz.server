const { models } = require("../config/db.config");
const Accounts = models.accounts;
const { createError } = require("./error.middleware");
const jwt = require("jsonwebtoken");

// Middleware xác thực tài khoản qua JWT token
exports.authenticateAccount = async (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createError(
        "AuthenticationError",
        "Vui lòng đăng nhập để tiếp tục",
        401
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw createError("AuthenticationError", "Token không hợp lệ", 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      throw createError("AuthenticationError", "Token không hợp lệ", 401);
    }

    // Tìm tài khoản và kiểm tra xem token có chứa thông tin mới nhất không
    const account = await Accounts.findByPk(decoded.id);
    if (!account) {
      throw createError("AuthenticationError", "Không tìm thấy tài khoản", 401);
    }

    // Kiểm tra xem thông tin trong token có khớp với thông tin hiện tại không
    if (
      decoded.username !== account.username ||
      decoded.email !== account.email ||
      decoded.role !== account.role ||
      decoded.fullName !== account.fullName ||
      decoded.avatar !== account.avatar ||
      new Date(decoded.createdAt).getTime() !== new Date(account.createdAt).getTime()
    ) {
      throw createError(
        "AuthenticationError",
        "Token không còn hợp lệ, vui lòng đăng nhập lại",
        401
      );
    }

    // Lưu thông tin tài khoản vào request
    req.account = account;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      next(createError("AuthenticationError", "Token không hợp lệ", 401));
    } else if (error.name === "TokenExpiredError") {
      next(createError("AuthenticationError", "Token đã hết hạn, vui lòng refresh token", 401));
    } else {
      next(error);
    }
  }
};

// Middleware xác thực tài khoản bằng ID
exports.authenticateById = async (req, res, next) => {
  try {
    const accountId = req.params.id;
    const account = await Accounts.findByPk(accountId);

    if (!account) {
      throw createError("NotFoundError", "Không tìm thấy tài khoản", 404);
    }

    req.account = account;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware xác thực tài khoản bằng username/email và password
exports.authenticateByCredentials = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username && !email) {
      throw createError(
        "ValidationError",
        "Vui lòng cung cấp username hoặc email",
        400
      );
    }

    const whereCondition = {};
    if (username) whereCondition.username = username;
    if (email) whereCondition.email = email;

    const account = await Accounts.findOne({ where: whereCondition });

    if (!account) {
      throw createError("NotFoundError", "Không tìm thấy tài khoản", 404);
    }

    if (password) {
      const bcrypt = require("bcryptjs");
      const isMatch = await bcrypt.compare(password, account.passwordHash);
      if (!isMatch) {
        throw createError("AuthenticationError", "Mật khẩu không đúng", 401);
      }
    }

    req.account = account;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware kiểm tra quyền truy cập
exports.checkRole = (roles = []) => {
  return (req, res, next) => {
    try {
      if (!req.account) {
        throw createError(
          "AuthenticationError",
          "Không có quyền truy cập",
          401
        );
      }

      if (roles.length && !roles.includes(req.account.role)) {
        throw createError(
          "AuthorizationError",
          "Không có quyền thực hiện thao tác này",
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware kiểm tra quyền admin
exports.isAdmin = (req, res, next) => {
  try {
    if (!req.account) {
      throw createError("AuthenticationError", "Không có quyền truy cập", 401);
    }

    if (req.account.role !== "admin") {
      throw createError(
        "AuthorizationError",
        "Chỉ admin mới có quyền thực hiện thao tác này",
        403
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
