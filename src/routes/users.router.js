
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');

// Tạo người dùng mới
router.post('/', usersController.createUser);

// Lấy tất cả người dùng
router.get('/', usersController.getAllUsers);

// Lấy người dùng theo ID
router.get('/:id', usersController.getUserById);

// Cập nhật người dùng
router.put('/:id', usersController.updateUser);

// Xóa người dùng
router.delete('/:id', usersController.deleteUser);

module.exports = router;