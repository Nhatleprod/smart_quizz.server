const { models } = require('../config/db.config');
const Comments = models.comments;
const { Op } = require('sequelize');

// Lấy tất cả bình luận với lọc tùy chọn
exports.findAll = async (req, res) => {
  try {
    const { accountId, examId, content } = req.query;
    
    const filter = {};
    
    if (accountId) {
      filter.accountId = accountId;
    }
    
    if (examId) {
      filter.examId = examId;
    }
    
    if (content) {
      filter.content = { [Op.like]: `%${content}%` };
    }
    
    const comments = await Comments.findAll({ 
      where: filter,
      order: [['createdAt', 'DESC']] // Sắp xếp theo thời gian tạo giảm dần (mới nhất lên đầu)
    });
    
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi truy xuất bình luận."
    });
  }
};

// Lấy một bình luận theo ID
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const comment = await Comments.findByPk(id);
    
    if (!comment) {
      return res.status(404).json({
        message: `Không tìm thấy bình luận với id ${id}.`
      });
    }
    
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi khi truy xuất bình luận."
    });
  }
};

// Tạo một bình luận mới
exports.create = async (req, res) => {
  try {
    const { accountId, examId, content } = req.body;
    
    // Xác thực các trường bắt buộc
    if (!accountId) {
      return res.status(400).json({
        message: "AccountId là bắt buộc!"
      });
    }
    
    if (!examId) {
      return res.status(400).json({
        message: "ExamId là bắt buộc!"
      });
    }
    
    if (!content) {
      return res.status(400).json({
        message: "Nội dung bình luận là bắt buộc!"
      });
    }
    
    // Tạo bình luận
    const comment = await Comments.create({
      accountId,
      examId,
      content
    });
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi tạo bình luận."
    });
  }
};

// Cập nhật một bình luận
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { content } = req.body;
    const userId = req.userId; // Lấy từ token qua middleware xác thực
    
    // Tìm bình luận để kiểm tra quyền sở hữu
    const comment = await Comments.findByPk(id);
    
    if (!comment) {
      return res.status(404).json({
        message: `Không tìm thấy bình luận với id ${id}.`
      });
    }
    
    // Kiểm tra xem người dùng có phải là chủ sở hữu của bình luận
    if (comment.accountId !== userId) {
      return res.status(403).json({
        message: "Bạn không có quyền cập nhật bình luận này!"
      });
    }
    
    // Chỉ cho phép cập nhật nội dung
    const [updated] = await Comments.update(
      { content },
      { where: { id: id } }
    );
    
    if (updated === 0) {
      return res.status(404).json({
        message: `Không tìm thấy bình luận với id ${id}.`
      });
    }
    
    res.status(200).json({
      message: "Bình luận đã được cập nhật thành công."
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi khi cập nhật bình luận."
    });
  }
};

// Xóa một bình luận
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId; 
    
    // Tìm bình luận để kiểm tra quyền sở hữu
    const comment = await Comments.findByPk(id);
    
    if (!comment) {
      return res.status(404).json({
        message: `Không tìm thấy bình luận với id ${id}.`
      });
    }
    
    // Kiểm tra xem người dùng có phải là chủ sở hữu của bình luận không
    if (comment.accountId !== userId) {
      return res.status(403).json({
        message: "Bạn không có quyền xóa bình luận này!"
      });
    }
    
    const deleted = await Comments.destroy({
      where: { id: id }
    });
    
    if (deleted === 0) {
      return res.status(404).json({
        message: `Không tìm thấy bình luận với id ${id}.`
      });
    }
    
    res.status(200).json({
      message: "Bình luận đã được xóa thành công."
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi khi xóa bình luận."
    });
  }
};

// Lấy bình luận theo examId kèm fullName của user qua account
exports.findByExamId = async (req, res) => {
  try {
    const examId = req.params.examId;

    const comments = await Comments.findAll({
      where: { examId: examId },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: models.accounts,
          as: 'account',
          attributes: ['id', 'avatarURL'],
          include: [
            {
              model: models.users,
              as: 'user',
              attributes: ['fullName']
            }
          ]
        }
      ]
    });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi khi truy xuất bình luận cho bài kiểm tra."
    });
  }
};

// Lấy bình luận theo accountId
exports.findByAccountId = async (req, res) => {
  try {
    const accountId = req.params.accountId;
    
    const comments = await Comments.findAll({
      where: { accountId: accountId },
      order: [['createdAt', 'DESC']], // Sắp xếp theo thời gian tạo giảm dần (mới nhất lên đầu)
      include: [
        {
          model: models.exams,
          as: 'exam',
          attributes: ['id', 'title'] // Chỉ lấy các thông tin cần thiết
        }
      ]
    });
    
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi khi truy xuất bình luận của người dùng."
    });
  }
};
