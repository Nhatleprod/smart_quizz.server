// File: src/controllers/exam_attempts.controller.js
const { models } = require('../config/db.config');
const Exam_attempts = models.exam_attempts;
const { Op } = require('sequelize');

// Lấy tất cả các lần thi
exports.findAll = async (req, res) => {
  try {
    const exam_attempts = await Exam_attempts.findAll();
    res.json(exam_attempts);
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy danh sách các lần thi",
      error: error.message
    });
  }
};

// Lấy thông tin một lần thi theo ID
exports.findOne = async (req, res) => {
  try {
    const exam_attempt = await Exam_attempts.findByPk(req.params.id);
    
    if (!exam_attempt) {
      return res.status(404).json({
        message: `Không tìm thấy lần thi với ID: ${req.params.id}`
      });
    }
    
    res.json(exam_attempt);
  } catch (error) {
    res.status(500).json({
      message: `Đã xảy ra lỗi khi lấy thông tin lần thi có ID: ${req.params.id}`,
      error: error.message
    });
  }
};

// Tạo một lần thi mới
exports.create = async (req, res) => {
  try {
    // Kiểm tra dữ liệu đầu vào
    if (!req.body.accountId || !req.body.examId) {
      return res.status(400).json({
        message: "ID tài khoản và ID bài thi không được để trống!"
      });
    }
    
    // Tạo một lần thi mới
    const exam_attempt = await Exam_attempts.create({
      accountId: req.body.accountId,
      examId: req.body.examId,
      score: req.body.score,
      attemptDate: req.body.attemptDate || new Date()
    });
    
    res.status(201).json(exam_attempt);
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi tạo lần thi mới",
      error: error.message
    });
  }
};

// Cập nhật thông tin lần thi
exports.update = async (req, res) => {
  try {
    const updated = await Exam_attempts.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (updated[0] === 0) {
      return res.status(404).json({
        message: `Không tìm thấy lần thi có ID: ${req.params.id}`
      });
    }
    
    res.json({ message: "Thông tin lần thi đã được cập nhật thành công!" });
  } catch (error) {
    res.status(500).json({
      message: `Đã xảy ra lỗi khi cập nhật thông tin lần thi có ID: ${req.params.id}`,
      error: error.message
    });
  }
};

// Xóa một lần thi
exports.delete = async (req, res) => {
  try {
    const deleted = await Exam_attempts.destroy({
      where: { id: req.params.id }
    });
    
    if (deleted === 0) {
      return res.status(404).json({
        message: `Không tìm thấy lần thi có ID: ${req.params.id}`
      });
    }
    
    res.json({ message: "Lần thi đã được xóa thành công!" });
  } catch (error) {
    res.status(500).json({
      message: `Đã xảy ra lỗi khi xóa lần thi có ID: ${req.params.id}`,
      error: error.message
    });
  }
};

// Lấy tất cả các lần thi của một tài khoản
exports.findByAccountId = async (req, res) => {
  try {
    const exam_attempts = await Exam_attempts.findAll({
      where: { accountId: req.params.accountId }
    });
    
    res.json(exam_attempts);
  } catch (error) {
    res.status(500).json({
      message: `Đã xảy ra lỗi khi lấy danh sách các lần thi của tài khoản có ID: ${req.params.accountId}`,
      error: error.message
    });
  }
};

// Lấy tất cả các lần thi của một bài thi
exports.findByExamId = async (req, res) => {
  try {
    const exam_attempts = await Exam_attempts.findAll({
      where: { examId: req.params.examId }
    });
    
    res.json(exam_attempts);
  } catch (error) {
    res.status(500).json({
      message: `Đã xảy ra lỗi khi lấy danh sách các lần thi của bài thi có ID: ${req.params.examId}`,
      error: error.message
    });
  }
};

// Cập nhật điểm số của một lần thi
exports.updateScore = async (req, res) => {
  try {
    if (req.body.score === undefined) {
      return res.status(400).json({
        message: "Điểm số không được để trống!"
      });
    }
    
    const updated = await Exam_attempts.update(
      { score: req.body.score },
      { where: { id: req.params.id } }
    );
    
    if (updated[0] === 0) {
      return res.status(404).json({
        message: `Không tìm thấy lần thi có ID: ${req.params.id}`
      });
    }
    
    res.json({ message: "Điểm số đã được cập nhật thành công!" });
  } catch (error) {
    res.status(500).json({
      message: `Đã xảy ra lỗi khi cập nhật điểm số cho lần thi có ID: ${req.params.id}`,
      error: error.message
    });
  }
};

// Lấy thông tin lần thi theo ID bài thi và ID tài khoản, kèm theo các câu trả lời
exports.findByExamIdAndAccountId = async (req, res) => {
  try {
    const exam_attempt = await Exam_attempts.findOne({
      where: {
        examId: req.params.examId,
        accountId: req.params.accountId
      },
      include: [
        {
          model: models.exam_attempt_details,
          as: 'exam_attempt_details'
        }
      ]
    });

    if (!exam_attempt) {
      return res.status(404).json({
        message: `Không tìm thấy lần thi với ID bài thi: ${req.params.examId} và ID tài khoản: ${req.params.accountId}`
      });
    }

    res.json(exam_attempt);
  } catch (error) {
    res.status(500).json({
      message: `Đã xảy ra lỗi khi lấy thông tin lần thi với ID bài thi: ${req.params.examId} và ID tài khoản: ${req.params.accountId}`,
      error: error.message
    });
  }
};
