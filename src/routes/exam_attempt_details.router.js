
// File: src/routes/exam_attempt_details.router.js
const express = require('express');
const router = express.Router();
const exam_attempt_detailsController = require('../controllers/exam_attempt_details.controller');

// Lấy tất cả chi tiết các lần thi
router.get('/', exam_attempt_detailsController.findAll);

// Tạo một chi tiết lần thi mới
router.post('/', exam_attempt_detailsController.create);

// Tạo nhiều chi tiết lần thi cùng lúc
router.post('/bulk', exam_attempt_detailsController.createBulk);

// Lấy thông tin chi tiết một lần thi theo ID
router.get('/:id', exam_attempt_detailsController.findOne);

// Cập nhật thông tin chi tiết lần thi
router.put('/:id', exam_attempt_detailsController.update);

// Xóa một chi tiết lần thi
router.delete('/:id', exam_attempt_detailsController.delete);

// Lấy chi tiết của một lần thi theo ID lần thi
router.get('/attempt/:examAttemptId', exam_attempt_detailsController.findByExamAttemptId);

// Lấy tất cả câu trả lời đúng của một lần thi
router.get('/attempt/:examAttemptId/correct', exam_attempt_detailsController.findCorrectAnswers);

// Lấy tất cả chi tiết lần thi của một câu hỏi
router.get('/question/:questionId', exam_attempt_detailsController.findByQuestionId);

// Lấy tất cả chi tiết lần thi của một câu trả lời
router.get('/answer/:answerId', exam_attempt_detailsController.findByAnswerId);

// Cập nhật câu trả lời và trạng thái đúng/sai
router.patch('/:id/answer', exam_attempt_detailsController.updateAnswer);

module.exports = router;