// src/controllers/accounts.controller.js
const { models } = require("../config/db.config");
const Accounts = models.accounts;
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  successResponse,
  listResponse,
  errorResponse,
} = require("../utils/response.util");
const { createError } = require("../middlewares/error.middleware");
const crypto = require("crypto");

// Tạo một tài khoản mới
exports.createAccount = async (req, res, next) => {
  try {
    const accountData = { ...req.body };
    delete accountData.confirmPassword;

    const newAccount = await Accounts.create(accountData);
    const { passwordHash, ...accountResponse } = newAccount.toJSON();

    successResponse(res, accountResponse, "Tạo tài khoản thành công", 201);
  } catch (error) {
    next(error);
  }
};

// Lấy tất cả tài khoản
exports.getAllAccounts = async (req, res, next) => {
  try {
    const accounts = await Accounts.findAll({
      attributes: { exclude: ["passwordHash"] },
    });

    listResponse(res, accounts, accounts.length);
  } catch (error) {
    next(error);
  }
};

// Lấy tài khoản theo ID
exports.getAccountById = async (req, res, next) => {
  try {
    // Nếu là admin hoặc là chủ tài khoản, trả về đầy đủ thông tin
    if (req.account.role === 'admin' || req.account.id === req.params.id) {
      const account = await Accounts.findByPk(req.params.id, {
        attributes: { exclude: ["passwordHash"] },
      });

      if (!account) {
        throw createError(
          "NotFoundError",
          "Không tìm thấy tài khoản với ID này",
          404
        );
      }

      return successResponse(res, account);
    }

    // Nếu là người dùng khác, chỉ trả về thông tin cơ bản
    const account = await Accounts.findByPk(req.params.id, {
      attributes: ['id', 'username', 'fullName', 'avatar', 'createdAt'],
    });

    if (!account) {
      throw createError(
        "NotFoundError",
        "Không tìm thấy tài khoản với ID này",
        404
      );
    }

    successResponse(res, account);
  } catch (error) {
    next(error);
  }
};

// Cập nhật tài khoản
exports.updateAccount = async (req, res, next) => {
  try {
    const account = await Accounts.findByPk(req.params.id);

    if (!account) {
      throw createError(
        "NotFoundError",
        "Không tìm thấy tài khoản với ID này",
        404
      );
    }

    // Không cho phép cập nhật một số trường nhạy cảm
    const sensitiveFields = ['role', 'passwordHash', 'email'];
    sensitiveFields.forEach(field => {
      if (req.body[field] && req.account.role !== 'admin') {
        delete req.body[field];
      }
    });

    await account.update(req.body);

    const updatedAccount = await Accounts.findByPk(req.params.id, {
      attributes: { exclude: ["passwordHash"] },
    });

    successResponse(res, updatedAccount, "Cập nhật tài khoản thành công");
  } catch (error) {
    next(error);
  }
};

// Đổi mật khẩu (cho người dùng đã đăng nhập)
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const account = req.account;

    // Kiểm tra mật khẩu hiện tại
    const isPasswordValid = await bcrypt.compare(oldPassword, account.passwordHash);
    if (!isPasswordValid) {
      throw createError(
        "ValidationError",
        "Mật khẩu hiện tại không đúng",
        400
      );
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu mới
    await account.update({ passwordHash: hashedPassword });
    const { passwordHash, ...accountData } = account.toJSON();

    // Thu hồi tất cả refresh token của người dùng
    await models.refresh_tokens.update(
      { isRevoked: true },
      { where: { accountId: account.id, isRevoked: false } }
    );

    successResponse(res, accountData, "Đổi mật khẩu thành công");
  } catch (error) {
    next(error);
  }
};

// Kiểm tra tài khoản tồn tại (cho chức năng quên mật khẩu)
exports.checkAccountExists = async (req, res, next) => {
  try {
    const { username, email } = req.body;
    const whereCondition = {};
    if (username) whereCondition.username = username;
    if (email) whereCondition.email = email;

    const account = await Accounts.findOne({
      where: whereCondition,
      attributes: ['id', 'username', 'email', 'fullName', 'avatar']
    });

    if (!account) {
      throw createError(
        "NotFoundError",
        "Không tìm thấy tài khoản với thông tin đã cung cấp",
        404
      );
    }

    // Tạo token tạm thời để xác thực bước reset password
    const resetToken = jwt.sign(
      { 
        id: account.id,
        action: 'reset_password',
        exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 phút
      },
      process.env.JWT_SECRET
    );

    successResponse(res, {
      account: {
        id: account.id,
        username: account.username,
        email: account.email,
        fullName: account.fullName,
        avatar: account.avatar
      },
      resetToken
    }, "Tìm thấy tài khoản");
  } catch (error) {
    next(error);
  }
};

// Đặt lại mật khẩu (cho người dùng quên mật khẩu)
exports.resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      if (!decoded || !decoded.id || decoded.action !== 'reset_password') {
        throw new Error('Invalid token');
      }
    } catch (error) {
      throw createError(
        "AuthenticationError",
        "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
        401
      );
    }

    // Tìm tài khoản
    const account = await Accounts.findByPk(decoded.id);
    if (!account) {
      throw createError(
        "NotFoundError",
        "Không tìm thấy tài khoản",
        404
      );
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu mới
    await account.update({ passwordHash: hashedPassword });

    // Thu hồi tất cả refresh token của người dùng
    await models.refresh_tokens.update(
      { isRevoked: true },
      { where: { accountId: account.id, isRevoked: false } }
    );

    successResponse(res, null, "Đặt lại mật khẩu thành công");
  } catch (error) {
    next(error);
  }
};

// Tạo token đặt lại mật khẩu
exports.createPasswordResetToken = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Tìm tài khoản theo email
    const account = await Accounts.findOne({ where: { email } });
    if (!account) {
      throw createError(
        "NotFoundError",
        "Không tìm thấy tài khoản với email này",
        404
      );
    }

    // Tạo token ngẫu nhiên
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    // Lưu token vào database
    await models.password_reset_tokens.create({
      accountId: account.id,
      token: resetToken,
      expiresAt,
      isUsed: false
    });

    // TODO: Gửi email với reset token
    // Trong môi trường production, bạn nên gửi email thay vì trả về token
    successResponse(
      res,
      { resetToken, expiresAt },
      "Token đặt lại mật khẩu đã được tạo. Vui lòng kiểm tra email của bạn."
    );
  } catch (error) {
    next(error);
  }
};

// Xóa tài khoản
exports.deleteAccount = async (req, res, next) => {
  try {
    const account = await Accounts.findByPk(req.params.id);

    if (!account) {
      throw createError(
        "NotFoundError",
        "Không tìm thấy tài khoản với ID này",
        404
      );
    }

    await account.destroy();
    successResponse(res, {}, "Xóa tài khoản thành công");
  } catch (error) {
    next(error);
  }
};

// Tìm kiếm tài khoản theo username hoặc email
exports.findAccountByUsernameOrEmail = async (req, res, next) => {
  try {
    const { username, email } = req.body;

    if (!username && !email) {
      throw createError(
        "ValidationError",
        "Vui lòng cung cấp username hoặc email để tìm kiếm",
        400
      );
    }

    const whereCondition = {};
    if (username) whereCondition.username = username;
    if (email) whereCondition.email = email;

    const account = await Accounts.findOne({
      where: whereCondition,
      attributes: { exclude: ["passwordHash"] },
    });

    if (!account) {
      throw createError("NotFoundError", "Không tìm thấy tài khoản", 404);
    }

    successResponse(res, account);
  } catch (error) {
    next(error);
  }
};

// Đăng nhập
exports.login = async (req, res, next) => {
  try {
    const { account } = req;

    // Tạo access token với thêm thông tin người dùng
    const accessToken = jwt.sign(
      {
        id: account.id,
        username: account.username,
        email: account.email,
        role: account.role,
        fullName: account.fullName,
        avatar: account.avatar,
        createdAt: account.createdAt
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m", // Token hết hạn sau 15 phút
      }
    );

    // Tạo refresh token
    const refreshToken = jwt.sign(
      { id: account.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" } // Refresh token hết hạn sau 7 ngày
    );

    // Lưu refresh token vào database
    await models.refresh_tokens.create({
      accountId: account.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
      isRevoked: false
    });

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        account: {
          id: account.id,
          username: account.username,
          email: account.email,
          role: account.role,
          fullName: account.fullName,
          avatar: account.avatar,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt,
        },
        accessToken,
        refreshToken,
        expiresIn: 15 * 60 // 15 phút
      },
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError("ValidationError", "Refresh token là bắt buộc", 400);
    }

    // Debug log
    console.log("Processing refresh token:", refreshToken);

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        throw createError("AuthenticationError", "Refresh token không hợp lệ", 401);
      }
      if (error.name === "TokenExpiredError") {
        throw createError("AuthenticationError", "Refresh token đã hết hạn", 401);
      }
      throw error;
    }

    if (!decoded || !decoded.id) {
      throw createError("AuthenticationError", "Refresh token không hợp lệ", 401);
    }

    // Tìm refresh token trong database và lấy thông tin tài khoản
    const tokenRecord = await models.refresh_tokens.findOne({
      where: {
        token: refreshToken,
        isRevoked: false,
        expiresAt: {
          [Op.gt]: new Date(), // expiresAt > current time
        },
      },
      include: [
        {
          model: models.accounts,
          as: "account",
          attributes: { exclude: ["passwordHash"] },
        },
      ],
    });

    if (!tokenRecord || !tokenRecord.account) {
      throw createError(
        "AuthenticationError",
        "Refresh token không hợp lệ hoặc đã hết hạn",
        401
      );
    }

    const account = tokenRecord.account;

    // Tạo access token mới với thêm thông tin người dùng
    const accessToken = jwt.sign(
      {
        id: account.id,
        username: account.username,
        email: account.email,
        role: account.role,
        fullName: account.fullName,
        avatar: account.avatar,
        createdAt: account.createdAt
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Trả về access token mới
    successResponse(
      res,
      {
        accessToken,
        expiresIn: 15 * 60, // 15 phút
        account: {
          id: account.id,
          username: account.username,
          email: account.email,
          role: account.role,
          fullName: account.fullName,
          avatar: account.avatar,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt,
        }
      },
      "Làm mới token thành công"
    );
  } catch (error) {
    console.error("Refresh token error:", error);
    next(error);
  }
};

// Đăng xuất (revoke refresh token)
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError("ValidationError", "Refresh token là bắt buộc", 400);
    }

    // Đánh dấu refresh token đã bị thu hồi
    const [updated] = await models.refresh_tokens.update(
      { isRevoked: true },
      {
        where: {
          token: refreshToken,
          isRevoked: false,
        },
      }
    );

    if (updated === 0) {
      throw createError("NotFoundError", "Không tìm thấy refresh token", 404);
    }

    successResponse(res, null, "Đăng xuất thành công");
  } catch (error) {
    next(error);
  }
};
