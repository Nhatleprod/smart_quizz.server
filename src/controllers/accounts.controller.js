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

    delete req.body.password;
    await account.update(req.body);

    const updatedAccount = await Accounts.findByPk(req.params.id, {
      attributes: { exclude: ["passwordHash"] },
    });

    successResponse(res, updatedAccount, "Cập nhật tài khoản thành công");
  } catch (error) {
    next(error);
  }
};

// Cập nhật mật khẩu tài khoản (dùng cho cả đổi mật khẩu và đặt lại mật khẩu)
exports.changePassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const account = req.account;

    // Cập nhật mật khẩu mới
    await account.update({ passwordHash: newPassword });
    const { passwordHash, ...accountData } = account.toJSON();

    successResponse(res, accountData, "Cập nhật mật khẩu thành công");
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

    // Tạo access token
    const accessToken = jwt.sign(
      {
        id: account.id,
        username: account.username,
        role: account.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m", // Token hết hạn sau 15 phút
      }
    );

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        account: {
          id: account.id,
          username: account.username,
          email: account.email,
          role: account.role,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt,
        },
        accessToken,
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

    // Tạo access token mới
    const accessToken = jwt.sign(
      {
        id: account.id,
        username: account.username,
        email: account.email,
        role: account.role,
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
      },
      "Làm mới token thành công"
    );
  } catch (error) {
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

// Kiểm tra tài khoản tồn tại (cho chức năng quên mật khẩu)
exports.checkAccountExists = async (req, res, next) => {
  try {
    const { passwordHash, ...accountData } = req.account.toJSON();
    successResponse(res, accountData, "Tìm thấy tài khoản");
  } catch (error) {
    next(error);
  }
};
