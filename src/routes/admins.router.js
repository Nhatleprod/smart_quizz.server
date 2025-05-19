const express = require('express');
const router = express.Router();
const adminsController = require('../controllers/admins.controller');

// Tạo admin mới
router.post('/', adminsController.createAdmin);

// Lấy tất cả admin
router.get('/', adminsController.getAllAdmins);

// Lấy admin theo ID
router.get('/:id', adminsController.getAdminById);

// Lấy admin theo accountId
router.get('/account/:accountId', adminsController.getAdminByAccountId);

// Cập nhật admin
router.put('/:id', adminsController.updateAdmin);

// Xóa admin
router.delete('/:id', adminsController.deleteAdmin);

module.exports = router;