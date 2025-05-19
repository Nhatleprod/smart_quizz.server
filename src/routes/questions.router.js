const express = require('express');
const router = express.Router();
const questionsController = require('../controllers/questions.controller');

// Lấy tất cả câu hỏi (với lọc tùy chọn)
router.get('/', questionsController.findAll);

// Tạo một câu hỏi mới
router.post('/', questionsController.create);

// Tạo nhiều câu hỏi cùng lúc
router.post('/bulk', questionsController.createBulk);

// Lấy một câu hỏi theo ID
router.get('/:id', questionsController.findOne);

// Cập nhật một câu hỏi
router.put('/:id', questionsController.update);

// Xóa một câu hỏi
router.delete('/:id', questionsController.delete);

// Lấy câu hỏi theo examId kèm danh sách câu trả lời 
router.get('/exam/:examId', questionsController.findByExamId);

module.exports = router;