// File: src/controllers/exam_attempt_details.controller.js
const { models } = require('../config/db.config');
const Exam_attempt_details = models.exam_attempt_details;
const { Op } = require('sequelize');

// Lấy tất cả chi tiết các lần thi
exports.findAll = async (req, res) => {
  try {
    const exam_attempt_details = await Exam_attempt_details.findAll();
    res.json(exam_attempt_details);
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy danh sách chi tiết các lần thi",
      error: error.message
    });
  }
};

// Lấy thông tin chi tiết một lần thi theo ID
exports.findOne = async (req, res) => {
  try {
    const exam_attempt_detail = await Exam_attempt_details.findByPk(req.params.id);
    
    if (!exam_attempt_detail) {
      return res.status(404).json({
        message: `Không tìm thấy chi tiết lần thi với ID: ${req.params.id}`
      });
    }
    
    res.json(exam_attempt_detail);
  } catch (error) {
    res.status(500).json({
      message: `Đã xảy ra lỗi khi lấy thông tin chi tiết lần thi có ID: ${req.params.id}`,
      error: error.message
    });
  }
};

// Tạo một chi tiết lần thi mới
exports.create = async (req, res) => {
  try {
    // Kiểm tra dữ liệu đầu vào
    if (!req.body.examAttemptId || !req.body.questionId || req.body.isCorrect === undefined || !req.body.answerId) {
      return res.status(400).json({
        message: "ID lần thi, ID câu hỏi, ID câu trả lời và trạng thái đúng/sai không được để trống!"
      });
    }
    
    // Tạo một chi tiết lần thi mới
    const exam_attempt_detail = await Exam_attempt_details.create({
      examAttemptId: req.body.examAttemptId,
      questionId: req.body.questionId,
      answerId: req.body.answerId,
      isCorrect: req.body.isCorrect
    });
    
    res.status(201).json(exam_attempt_detail);
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi tạo chi tiết lần thi mới",
      error: error.message
    });
  }
};

// Cập nhật thông tin chi tiết lần thi
exports.update = async (req, res) => {
  try {
    const updated = await Exam_attempt_details.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (updated[0] === 0) {
      return res.status(404).json({
        message: `Không tìm thấy chi tiết lần thi có ID: ${req.params.id}`
      });
    }
    
    res.json({ message: "Thông tin chi tiết lần thi đã được cập nhật thành công!" });
  } catch (error) {
    res.status(500).json({
      message: `Đã xảy ra lỗi khi cập nhật thông tin chi tiết lần thi có ID: ${req.params.id}`,
      error: error.message
    });
  }
};

// Xóa một chi tiết lần thi
exports.delete = async (req, res) => {
  try {
    const deleted = await Exam_attempt_details.destroy({
      where: { id: req.params.id }
    });
    
    if (deleted === 0) {
      return res.status(404).json({
        message: `Không tìm thấy chi tiết lần thi có ID: ${req.params.id}`
      });
    }
    
    res.json({ message: "Chi tiết lần thi đã được xóa thành công!" });
  } catch (error) {
    res.status(500).json({
      message: `Đã xảy ra lỗi khi xóa chi tiết lần thi có ID: ${req.params.id}`,
      error: error.message
    });
  }
};

// Lấy chi tiết một lần thi theo ID lần thi
exports.findByExamAttemptId = async (req, res) => {
  try {
    const exam_attempt_details = await Exam_attempt_details.findAll({
      where: { examAttemptId: req.params.examAttemptId }
    });
    
    res.json(exam_attempt_details);
  } catch (error) {
    res.status(500).json({
      message: `Đã xảy ra lỗi khi lấy chi tiết của lần thi có ID: ${req.params.examAttemptId}`,
      error: error.message
    });
  }
};

// Lấy tất cả chi tiết lần thi của một câu hỏi
exports.findByQuestionId = async (req, res) => {
  try {
    const exam_attempt_details = await Exam_attempt_details.findAll({
      where: { questionId: req.params.questionId }
    });
    
    res.json(exam_attempt_details);
  } catch (error) {
    res.status(500).json({
      message: `Đã xảy ra lỗi khi lấy chi tiết lần thi của câu hỏi có ID: ${req.params.questionId}`,
      error: error.message
    });
  }
};

// Lấy tất cả chi tiết lần thi của một câu trả lời
exports.findByAnswerId = async (req, res) => {
  try {
    const exam_attempt_details = await Exam_attempt_details.findAll({
      where: { answerId: req.params.answerId }
    });
    
    res.json(exam_attempt_details);
  } catch (error) {
    res.status(500).json({
      message: `Đã xảy ra lỗi khi lấy chi tiết lần thi của câu trả lời có ID: ${req.params.answerId}`,
      error: error.message
    });
  }
};

// Lấy tất cả câu trả lời đúng của một lần thi
exports.findCorrectAnswers = async (req, res) => {
  try {
    const exam_attempt_details = await Exam_attempt_details.findAll({
      where: { 
        examAttemptId: req.params.examAttemptId,
        isCorrect: true
      }
    });
    
    res.json(exam_attempt_details);
  } catch (error) {
    res.status(500).json({
      message: `Đã xảy ra lỗi khi lấy danh sách câu trả lời đúng của lần thi có ID: ${req.params.examAttemptId}`,
      error: error.message
    });
  }
};

// Cập nhật câu trả lời và trạng thái đúng/sai
exports.updateAnswer = async (req, res) => {
  try {
    if (!req.body.answerId || req.body.isCorrect === undefined) {
      return res.status(400).json({
        message: "ID câu trả lời và trạng thái đúng/sai không được để trống!"
      });
    }
    
    const updated = await Exam_attempt_details.update(
      { 
        answerId: req.body.answerId,
        isCorrect: req.body.isCorrect
      },
      { where: { id: req.params.id } }
    );
    
    if (updated[0] === 0) {
      return res.status(404).json({
        message: `Không tìm thấy chi tiết lần thi có ID: ${req.params.id}`
      });
    }
    
    res.json({ message: "Câu trả lời đã được cập nhật thành công!" });
  } catch (error) {
    res.status(500).json({
      message: `Đã xảy ra lỗi khi cập nhật câu trả lời cho chi tiết lần thi có ID: ${req.params.id}`,
      error: error.message
    });
  }
};

// Tạo nhiều chi tiết lần thi cùng lúc
exports.createBulk = async (req, res) => {
  try {
    if (!req.body.details || !Array.isArray(req.body.details) || req.body.details.length === 0) {
      return res.status(400).json({
        message: "Chi tiết lần thi phải là một mảng và không được để trống!"
      });
    }
    
    // Kiểm tra dữ liệu đầu vào
    for (let detail of req.body.details) {
      if (!detail.examAttemptId || !detail.questionId || detail.isCorrect === undefined) {
        return res.status(400).json({
          message: "ID lần thi, ID câu hỏi và trạng thái đúng/sai không được để trống cho mỗi chi tiết!"
        });
      }
    }
    
    // Tạo nhiều chi tiết lần thi cùng lúc
    const exam_attempt_details = await Exam_attempt_details.bulkCreate(req.body.details);
    
    res.status(201).json(exam_attempt_details);
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi tạo nhiều chi tiết lần thi",
      error: error.message
    });
  }
};