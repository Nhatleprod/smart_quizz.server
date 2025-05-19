const express = require('express');
const router = express.Router();
const ratingsController = require('../controllers/ratings.controller');

// Lấy tất cả đánh giá (với lọc tùy chọn)
router.get('/', ratingsController.findAll);

// Tạo một đánh giá mới
router.post('/', ratingsController.create);

// Lấy một đánh giá theo ID
router.get('/:id', ratingsController.findOne);

// Cập nhật một đánh giá
router.put('/:id', ratingsController.update);

// Xóa một đánh giá
router.delete('/:id', ratingsController.delete);

// Lấy đánh giá theo examId
router.get('/exam/:examId', ratingsController.findByExamId);

// Lấy thống kê đánh giá cho một bài kiểm tra
router.get('/exam/:examId/stats', ratingsController.getExamRatingStats);

// Lấy đánh giá theo accountId
router.get('/account/:accountId', ratingsController.findByAccountId);

module.exports = router;