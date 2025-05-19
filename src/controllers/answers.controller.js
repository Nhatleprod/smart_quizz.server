// File: src/routes/answers.router.js
const { models } = require('../config/db.config');
const Answers = models.answers;
const { Op } = require('sequelize');

// Lấy tất cả câu trả lời với lọc tùy chọn
exports.findAll = async (req, res) => {
  try {
    const { questionId, isCorrect, content } = req.query;
    
    const filter = {};
    
    if (questionId) {
      filter.questionId = questionId;
    }
    
    if (isCorrect !== undefined) {
      filter.isCorrect = isCorrect === 'true';
    }
    
    if (content) {
      filter.content = { [Op.like]: `%${content}%` };
    }
    
    const answers = await Answers.findAll({ where: filter });
    
    res.status(200).json(answers);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi truy xuất câu trả lời."
    });
  }
};

// Lấy một câu trả lời theo ID
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const answer = await Answers.findByPk(id);
    
    if (!answer) {
      return res.status(404).json({
        message: `Không tìm thấy câu trả lời với id ${id}.`
      });
    }
    
    res.status(200).json(answer);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi khi truy xuất câu trả lời."
    });
  }
};

// Tạo một câu trả lời mới
exports.create = async (req, res) => {
  try {
    const { questionId, content, isCorrect, explanation } = req.body;
    
    // Xác thực các trường bắt buộc
    if (!questionId) {
      return res.status(400).json({
        message: "QuestionId là bắt buộc!"
      });
    }
    
    if (!content) {
      return res.status(400).json({
        message: "Nội dung câu trả lời là bắt buộc!",
        error: "content"
      });
    }
    
    // Tạo câu trả lời
    const answer = await Answers.create({
      questionId,
      content,
      isCorrect,
      explanation
    });
    
    res.status(201).json(answer);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi tạo câu trả lời."
    });
  }
};

// Cập nhật một câu trả lời
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    const [updated] = await Answers.update(req.body, {
      where: { id: id }
    });
    
    if (updated === 0) {
      return res.status(404).json({
        message: `Không tìm thấy câu trả lời với id ${id}.`
      });
    }
    
    res.status(200).json({
      message: "Câu trả lời đã được cập nhật thành công."
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi khi cập nhật câu trả lời."
    });
  }
};

// Xóa một câu trả lời
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    const deleted = await Answers.destroy({
      where: { id: id }
    });
    
    if (deleted === 0) {
      return res.status(404).json({
        message: `Không tìm thấy câu trả lời với id ${id}.`
      });
    }
    
    res.status(200).json({
      message: "Câu trả lời đã được xóa thành công."
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi khi xóa câu trả lời."
    });
  }
};

// Lấy câu trả lời theo questionId
exports.findByQuestionId = async (req, res) => {
  try {
    const questionId = req.params.questionId;
    
    const answers = await Answers.findAll({
      where: { questionId: questionId }
    });
    
    res.status(200).json(answers);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi khi truy xuất câu trả lời cho câu hỏi."
    });
  }
};

// Đánh dấu một câu trả lời là đúng
exports.markAsCorrect = async (req, res) => {
  try {
    const id = req.params.id;
    const questionId = req.body.questionId;
    
    if (!questionId) {
      return res.status(400).json({
        message: "Cần cung cấp questionId để đánh dấu câu trả lời đúng!"
      });
    }

    // Đầu tiên, đặt tất cả câu trả lời của câu hỏi này thành isCorrect = false
    await Answers.update(
      { isCorrect: false },
      { where: { questionId: questionId } }
    );
    
    // Sau đó, đặt câu trả lời được chọn thành isCorrect = true
    const [updated] = await Answers.update(
      { isCorrect: true },
      { where: { id: id } }
    );
    
    if (updated === 0) {
      return res.status(404).json({
        message: `Không tìm thấy câu trả lời với id ${id}.`
      });
    }
    
    res.status(200).json({
      message: "Câu trả lời đã được đánh dấu là đúng."
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi khi đánh dấu câu trả lời đúng."
    });
  }
};

// Tạo nhiều câu trả lời cùng lúc
exports.createBulk = async (req, res) => {
  try {
    const { answers } = req.body;
    
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        message: "Cần cung cấp một mảng các câu trả lời!"
      });
    }
    
    // Kiểm tra tất cả câu trả lời có questionId và content
    for (const answer of answers) {
      if (!answer.questionId || !answer.content) {
        return res.status(400).json({
          message: "Mỗi câu trả lời phải có questionId và content!"
        });
      }
    }
    
    // Tạo nhiều câu trả lời
    const createdAnswers = await Answers.bulkCreate(answers);
    
    res.status(201).json(createdAnswers);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi tạo các câu trả lời."
    });
  }
};