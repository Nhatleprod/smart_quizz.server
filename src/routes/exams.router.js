const express = require('express');
const router = express.Router();
const examsController = require('../controllers/exams.controller');
// Nhật làm middleware xác thực nhé

// lấy tất cả bài thi (với lọc tùy chọn)
router.get('/', examsController.findAll);

// Tạo bài thi mới
router.post('/', examsController.create);

// Lấy bài thi theo ID
router.get('/:id', examsController.findOne);

// Cập nhật bài thi
router.put('/:id', examsController.update);

// Xóa bài thi
router.delete('/:id', examsController.delete);

// Lấy bài thi theo ID tài khoản(xem tất cả bài thi của một tài khoản)
router.get('/account/:accountId', examsController.findByAccountId);

// Xác nhận bài thi, chỉ admin mới có quyền này và hiện tại chưa có middleware xác thực
router.patch('/:id/approve', examsController.approve);

module.exports = router;