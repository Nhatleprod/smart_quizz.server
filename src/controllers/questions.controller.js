const { models } = require('../config/db.config');
const Questions = models.questions;
const Answers = models.answers;
const { Op } = require('sequelize');

// Lấy tất cả câu hỏi với lọc tùy chọn
exports.findAll = async (req, res) => {
  try {
    const { examId, content } = req.query;
    
    const filter = {};
    
    if (examId) {
      filter.examId = examId;
    }
    
    if (content) {
      filter.content = { [Op.like]: `%${content}%` };
    }
    
    const questions = await Questions.findAll({ where: filter });
    
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi truy xuất câu hỏi."
    });
  }
};

// Lấy một câu hỏi theo ID
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const question = await Questions.findByPk(id);
    
    if (!question) {
      return res.status(404).json({
        message: `Không tìm thấy câu hỏi với id ${id}.`
      });
    }
    
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi khi truy xuất câu hỏi."
    });
  }
};

// Tạo một câu hỏi mới
exports.create = async (req, res) => {
  try {
    const { examId, content } = req.body;
    
    // Xác thực các trường bắt buộc
    if (!examId) {
      return res.status(400).json({
        message: "ExamId là bắt buộc!"
      });
    }
    
    if (!content) {
      return res.status(400).json({
        message: "Nội dung câu hỏi là bắt buộc!"
      });
    }
    
    // Tạo câu hỏi
    const question = await Questions.create({
      examId,
      content
    });
    
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi tạo câu hỏi."
    });
  }
};

// Cập nhật một câu hỏi
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    const [updated] = await Questions.update(req.body, {
      where: { id: id }
    });
    
    if (updated === 0) {
      return res.status(404).json({
        message: `Không tìm thấy câu hỏi với id ${id}.`
      });
    }
    
    res.status(200).json({
      message: "Câu hỏi đã được cập nhật thành công."
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi khi cập nhật câu hỏi."
    });
  }
};

// Xóa một câu hỏi và các câu trả lời liên quan
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    // Xóa tất cả câu trả lời liên quan trước
    await Answers.destroy({
      where: { questionId: id }
    });

    // Sau đó xóa câu hỏi
    const deleted = await Questions.destroy({
      where: { id: id }
    });

    if (deleted === 0) {
      return res.status(404).json({
        message: `Không tìm thấy câu hỏi với id ${id}.`
      });
    }

    res.status(200).json({
      message: "Câu hỏi và các câu trả lời liên quan đã được xóa thành công."
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi khi xóa câu hỏi."
    });
  }
};

// Lấy câu hỏi theo examId kèm danh sách câu trả lời
exports.findByExamId = async (req, res) => {
  try {
    const examId = req.params.examId;

    const questions = await Questions.findAll({
      where: { examId: examId },
      include: [
        {
          model: Answers,
          as: 'answers',
          attributes: { exclude: ['createdAt', 'updatedAt'] }
        }
      ]
    });

    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi khi truy xuất câu hỏi cho bài kiểm tra."
    });
  }
};

// Tạo nhiều câu hỏi cùng lúc
exports.createBulk = async (req, res) => {
  try {
    const { questions } = req.body;
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        message: "Cần cung cấp một mảng các câu hỏi!"
      });
    }
    
    // Kiểm tra tất cả câu hỏi có examId và content
    for (const question of questions) {
      if (!question.examId || !question.content) {
        return res.status(400).json({
          message: "Mỗi câu hỏi phải có examId và content!"
        });
      }
    }
    
    // Tạo nhiều câu hỏi
    const createdQuestions = await Questions.bulkCreate(questions);
    
    res.status(201).json(createdQuestions);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi tạo các câu hỏi."
    });
  }
};

// Tạo 1 câu hỏi với danh sách 4 câu trả lời
exports.createWithAnswers = async (req, res) => {
  try {
    const { examId, content, answers } = req.body;
    
    // Xác thực các trường bắt buộc
    if (!examId) {
      return res.status(400).json({
        message: "ExamId là bắt buộc!"
      });
    }
    
    if (!content) {
      return res.status(400).json({
        message: "Nội dung câu hỏi là bắt buộc!"
      });
    }
    
    if (!answers || !Array.isArray(answers) || answers.length !== 4) {
      return res.status(400).json({
        message: "Cần cung cấp đúng 4 câu trả lời!"
      });
    }
    
    // Tạo câu hỏi
    const question = await Questions.create({
      examId,
      content
    });

    // in ra id của câu hỏi vừa tạo
    // console.log("ID câu hỏi vừa tạo:", question.id);
    
    // Tạo danh sách câu trả lời
    const answersWithQuestionId = answers.map(answer => ({
      ...answer,
      questionId: question.id
    }));
    
    await Answers.bulkCreate(answersWithQuestionId);
    
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi tạo câu hỏi với danh sách câu trả lời."
    });
  }
};