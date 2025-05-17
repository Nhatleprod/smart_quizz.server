// src/controllers/accounts.controller.js
const { models } = require('../config/db.config');
const Accounts = models.accounts;
const { Op } = require('sequelize');

// Tạo một tài khoản mới
exports.createAccount = async (req, res) => {
  try {
    // Dữ liệu đã được validate và password đã được hash qua middleware
    const newAccount = await Accounts.create(req.body);
    
    // Không trả về passwordHash trong response
    const { passwordHash, ...accountData } = newAccount.toJSON();
    
    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản thành công',
      data: accountData
    });
  } catch (error) {
    // Xử lý lỗi trùng lặp email/username
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0].path;
      return res.status(400).json({
        success: false,
        message: `${field === 'email' ? 'Email' : 'Tên người dùng'} đã tồn tại`
      });
    }
    
    console.error('Lỗi khi tạo tài khoản:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi tạo tài khoản',
      error: error.message
    });
  }
};

// Lấy tất cả tài khoản
exports.getAllAccounts = async (req, res) => {
  try {
    const accounts = await Accounts.findAll({
      attributes: { exclude: ['passwordHash'] } // Không bao gồm passwordHash trong kết quả trả về
    });
    
    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách tài khoản:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy danh sách tài khoản',
      error: error.message
    });
  }
};

// Lấy tài khoản theo ID
exports.getAccountById = async (req, res) => {
  try {
    const account = await Accounts.findByPk(req.params.id, {
      attributes: { exclude: ['passwordHash'] }
    });
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản với ID này'
      });
    }
    
    res.status(200).json({
      success: true,
      data: account
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin tài khoản:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy thông tin tài khoản',
      error: error.message
    });
  }
};

// Cập nhật tài khoản
exports.updateAccount = async (req, res) => {
  try {
    const account = await Accounts.findByPk(req.params.id);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản với ID này'
      });
    }
    
    await account.update(req.body);
    
    // Lấy dữ liệu đã cập nhật nhưng loại bỏ passwordHash
    const updatedAccount = await Accounts.findByPk(req.params.id, {
      attributes: { exclude: ['passwordHash'] }
    });
    
    res.status(200).json({
      success: true,
      message: 'Cập nhật tài khoản thành công',
      data: updatedAccount
    });
  } catch (error) {
    // Xử lý lỗi trùng lặp email/username khi cập nhật
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0].path;
      return res.status(400).json({
        success: false,
        message: `${field === 'email' ? 'Email' : 'Tên người dùng'} đã tồn tại`
      });
    }
    
    console.error('Lỗi khi cập nhật tài khoản:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi cập nhật tài khoản',
      error: error.message
    });
  }
};

// Xóa tài khoản
exports.deleteAccount = async (req, res) => {
  try {
    const account = await Accounts.findByPk(req.params.id);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản với ID này'
      });
    }
    
    await account.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Xóa tài khoản thành công',
      data: {}
    });
  } catch (error) {
    console.error('Lỗi khi xóa tài khoản:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xóa tài khoản',
      error: error.message
    });
  }
};