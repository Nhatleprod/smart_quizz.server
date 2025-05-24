// File: src/routes/answers.router.js
const express = require('express');
const router = express.Router();
const answersController = require('../controllers/answers.controller');

// Lấy tất cả câu trả lời (với lọc tùy chọn)
router.get('/', answersController.findAll);

// Tạo một câu trả lời mới
router.post('/', answersController.create);

// Tạo nhiều câu trả lời cùng lúc
router.post('/bulk', answersController.createBulk);

// Lấy một câu trả lời theo ID
router.get('/:id', answersController.findOne);

// Cập nhật một câu trả lời
router.put('/:id', answersController.update);

// Xóa một câu trả lời
router.delete('/:id', answersController.delete);

// Lấy câu trả lời theo questionId
router.get('/question/:questionId', answersController.findByQuestionId);

// Đánh dấu một câu trả lời là đúng
router.patch('/:id/correct', answersController.markAsCorrect);

module.exports = router;