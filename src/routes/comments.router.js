const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/comments.controller');

// Lấy tất cả bình luận (với lọc tùy chọn)
router.get('/', commentsController.findAll);

// Tạo một bình luận mới
router.post('/', commentsController.create);

// Lấy một bình luận theo ID
router.get('/:id', commentsController.findOne);

// Cập nhật một bình luận (chỉ chủ sở hữu)
router.put('/:id', commentsController.update);

// Xóa một bình luận (chủ sở hữu hoặc admin, chưa có middleware xác thực)
router.delete('/:id', commentsController.delete);

// Lấy bình luận theo examId
router.get('/exam/:examId', commentsController.findByExamId);

// Lấy bình luận theo accountId
router.get('/account/:accountId', commentsController.findByAccountId);

module.exports = router;
