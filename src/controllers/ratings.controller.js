const { models } = require('../config/db.config');
const Ratings = models.ratings;
const { Op } = require('sequelize');
const Sequelize = require('sequelize');

// Lấy tất cả đánh giá với lọc tùy chọn
exports.findAll = async (req, res) => {
  try {
    const { accountId, examId, rating } = req.query;
    
    const filter = {};
    
    if (accountId) {
      filter.accountId = accountId;
    }
    
    if (examId) {
      filter.examId = examId;
    }
    
    if (rating) {
      filter.rating = rating;
    }
    
    const ratings = await Ratings.findAll({ 
      where: filter,
      order: [['createdAt', 'DESC']] // Sắp xếp theo thời gian tạo giảm dần (mới nhất lên đầu)
    });
    
    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi truy xuất đánh giá."
    });
  }
};

// Lấy một đánh giá theo ID
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const rating = await Ratings.findByPk(id);
    
    if (!rating) {
      return res.status(404).json({
        message: `Không tìm thấy đánh giá với id ${id}.`
      });
    }
    
    res.status(200).json(rating);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi khi truy xuất đánh giá."
    });
  }
};

// Tạo một đánh giá mới
exports.create = async (req, res) => {
  try {
    const { accountId, examId, content, rating } = req.body;
    
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
    
    if (rating === undefined || rating === null) {
      return res.status(400).json({
        message: "Điểm đánh giá là bắt buộc!"
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Điểm đánh giá phải từ 1 đến 5!"
      });
    }
    
    // Kiểm tra xem người dùng đã đánh giá bài kiểm tra này chưa
    const existingRating = await Ratings.findOne({
      where: {
        accountId: accountId,
        examId: examId
      }
    });
    
    if (existingRating) {
      return res.status(400).json({
        message: "Bạn đã đánh giá bài kiểm tra này rồi! Vui lòng sử dụng chức năng cập nhật."
      });
    }
    
    // Tạo đánh giá
    const newRating = await Ratings.create({
      accountId,
      examId,
      content,
      rating
    });
    
    res.status(201).json(newRating);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi tạo đánh giá."
    });
  }
};

// Cập nhật một đánh giá
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { content, rating } = req.body;
    
    // Tìm đánh giá cần cập nhật
    const ratingObj = await Ratings.findByPk(id);
    
    if (!ratingObj) {
      return res.status(404).json({
        message: `Không tìm thấy đánh giá với id ${id}.`
      });
    }
    
    // Xác thực điểm đánh giá
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        message: "Điểm đánh giá phải từ 1 đến 5!"
      });
    }
    
    // Cập nhật đánh giá
    const updateData = {};
    if (content !== undefined) updateData.content = content;
    if (rating !== undefined) updateData.rating = rating;
    
    const [updated] = await Ratings.update(updateData, {
      where: { id: id }
    });
    
    if (updated === 0) {
      return res.status(404).json({
        message: `Không tìm thấy đánh giá với id ${id}.`
      });
    }
    
    res.status(200).json({
      message: "Đánh giá đã được cập nhật thành công."
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi khi cập nhật đánh giá."
    });
  }
};

// Xóa một đánh giá
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    const deleted = await Ratings.destroy({
      where: { id: id }
    });
    
    if (deleted === 0) {
      return res.status(404).json({
        message: `Không tìm thấy đánh giá với id ${id}.`
      });
    }
    
    res.status(200).json({
      message: "Đánh giá đã được xóa thành công."
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi khi xóa đánh giá."
    });
  }
};

// Lấy đánh giá theo examId
exports.findByExamId = async (req, res) => {
  try {
    const examId = req.params.examId;
    
    const ratings = await Ratings.findAll({
      where: { examId: examId },
      order: [['createdAt', 'DESC']], // Sắp xếp theo thời gian tạo giảm dần (mới nhất lên đầu)
      include: [
        {
          model: models.accounts,
          as: 'account',
          attributes: ['avatarURL'],
          include: [
            {
              model: models.users,
              as: 'user',
              attributes: ['fullName'] // Chỉ lấy tên đầy đủ của người dùng
            }
          ]
        }
      ]
    });
    
    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi khi truy xuất đánh giá cho bài kiểm tra."
    });
  }
};

// Lấy đánh giá theo accountId
exports.findByAccountId = async (req, res) => {
  try {
    const accountId = req.params.accountId;
    
    const ratings = await Ratings.findAll({
      where: { accountId: accountId },
      order: [['createdAt', 'DESC']], // Sắp xếp theo thời gian tạo giảm dần (mới nhất lên đầu)
      include: [
        {
          model: models.exams,
          as: 'exam',
          attributes: ['id', 'title', 'category', 'level'] // Chỉ lấy các thông tin cần thiết
        }
      ]
    });
    
    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi khi truy xuất đánh giá của người dùng."
    });
  }
};

// Lấy thống kê đánh giá cho một bài kiểm tra
exports.getExamRatingStats = async (req, res) => {
  try {
    const examId = req.params.examId;
    
    // Tính tổng số đánh giá và điểm trung bình
    const stats = await Ratings.findAll({
      where: { examId: examId },
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalRatings'],
        [Sequelize.fn('AVG', Sequelize.col('rating')), 'averageRating'],
        [Sequelize.fn('MIN', Sequelize.col('rating')), 'lowestRating'],
        [Sequelize.fn('MAX', Sequelize.col('rating')), 'highestRating']
      ],
      raw: true
    });
    
    // Đếm số lượng mỗi mức đánh giá
    const ratingCounts = await Ratings.findAll({
      where: { examId: examId },
      attributes: [
        'rating',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['rating'],
      order: [['rating', 'DESC']],
      raw: true
    });
    
    // Định dạng lại kết quả để dễ sử dụng
    const formattedStats = {
      examId: examId,
      totalRatings: parseInt(stats[0].totalRatings) || 0,
      averageRating: parseFloat(stats[0].averageRating) || 0,
      lowestRating: parseInt(stats[0].lowestRating) || 0,
      highestRating: parseInt(stats[0].highestRating) || 0,
      ratingCounts: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      }
    };
    
    // Cập nhật số lượng cho từng mức đánh giá
    ratingCounts.forEach(item => {
      formattedStats.ratingCounts[item.rating] = parseInt(item.count);
    });
    
    // Làm tròn điểm trung bình đến 1 chữ số thập phân
    formattedStats.averageRating = Math.round(formattedStats.averageRating * 10) / 10;
    
    res.status(200).json(formattedStats);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi khi lấy thống kê đánh giá."
    });
  }
};
