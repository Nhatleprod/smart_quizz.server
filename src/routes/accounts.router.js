// src/routes/accounts.router.js
const express = require('express');
const router = express.Router();

// Controllers
const accountsController = require('../controllers/accounts.controller');

// Middlewares
const { validateCreateAccount, validateUpdateAccount, validateAccountId } = require('../middlewares/validation.middleware');
const { hashPassword } = require('../middlewares/hashPassword.middleware');

// Routes
// Tạo tài khoản mới
router.post('/', validateCreateAccount, hashPassword, accountsController.createAccount);

// Lấy tất cả tài khoản
router.get('/', accountsController.getAllAccounts);

// Lấy tài khoản theo ID
router.get('/:id', validateAccountId, accountsController.getAccountById);

// Cập nhật tài khoản
router.put('/:id', validateUpdateAccount, hashPassword, accountsController.updateAccount);

// Xóa tài khoản
router.delete('/:id', validateAccountId, accountsController.deleteAccount);

module.exports = router;