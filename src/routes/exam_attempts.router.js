// File: src/routes/exam_attempts.router.js
const express = require('express');
const router = express.Router();
const exam_attemptsController = require('../controllers/exam_attempts.controller');

// Lấy tất cả các lần thi
router.get('/', exam_attemptsController.findAll);

// Tạo một lần thi mới
router.post('/', exam_attemptsController.create);

// Lấy thông tin một lần thi theo ID
router.get('/:id', exam_attemptsController.findOne);

// Cập nhật thông tin lần thi
router.put('/:id', exam_attemptsController.update);

// Xóa một lần thi
router.delete('/:id', exam_attemptsController.delete);

// Lấy tất cả các lần thi của một tài khoản
router.get('/account/:accountId', exam_attemptsController.findByAccountId);

// Lấy tất cả các lần thi của một bài thi
router.get('/exam/:examId', exam_attemptsController.findByExamId);

// Lấy thông tin một lần thi theo ID bài thi và ID tài khoản
router.get('/exam/:examId/account/:accountId', exam_attemptsController.findByExamIdAndAccountId);

// Cập nhật điểm số của một lần thi
router.patch('/:id/score', exam_attemptsController.updateScore);

module.exports = router;