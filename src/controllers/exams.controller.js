const { models } = require('../config/db.config');
const Exams = models.exams;
const Questions = models.questions;
const ExamAttempts = models.exam_attempts;
const Ratings = models.ratings;
const { Op } = require('sequelize');

// Lấy danh sách tất cả các bài thi cùng với số lượng câu hỏi, trung bình ratings và số lượng exam attempts cho mỗi bài thi
exports.findAll = async (req, res) => {
  try {
    const { title, category, level, isApproved } = req.query;
    
    const filter = {};
    
    if (title) {
      filter.title = { [Op.like]: `%${title}%` };
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (level) {
      filter.level = level;
    }
    
    if (isApproved !== undefined) {
      filter.isApproved = isApproved === 'true';
    }
    
    const exams = await Exams.findAll({ where: filter });

    // Get questionCount for each exam
    const examIds = exams.map(exam => exam.id);

    // Get question counts
    const questionCounts = await Questions.findAll({
      attributes: ['examId', [Questions.sequelize.fn('COUNT', Questions.sequelize.col('id')), 'count']],
      where: { examId: examIds },
      group: ['examId']
    });

    // Get average ratings
    const ratingAverages = await Ratings.findAll({
      attributes: [
        'examId',
        [Ratings.sequelize.fn('AVG', Ratings.sequelize.col('rating')), 'avgRating']
      ],
      where: { examId: examIds },
      group: ['examId']
    });

    // Lấy số lượng exam attempts(số người làm bài thi)
    const attemptCounts = await ExamAttempts.findAll({
      attributes: [
        'examId',
        [ExamAttempts.sequelize.fn('COUNT', ExamAttempts.sequelize.col('id')), 'attemptCount']
      ],
      where: { examId: examIds },
      group: ['examId']
    });

    // Map examId to values
    const countMap = {};
    questionCounts.forEach(qc => {
      countMap[qc.examId] = parseInt(qc.get('count'), 10);
    });

    const avgRatingMap = {};
    ratingAverages.forEach(r => {
      avgRatingMap[r.examId] = parseFloat(r.get('avgRating')) || 0;
    });

    const attemptCountMap = {};
    attemptCounts.forEach(a => {
      attemptCountMap[a.examId] = parseInt(a.get('attemptCount'), 10);
    });

    // Attach data to each exam
    const examsWithStats = exams.map(exam => ({
      ...exam.toJSON(),
      questionCount: countMap[exam.id] || 0,
      avgRating: avgRatingMap[exam.id] || 0,
      attemptCount: attemptCountMap[exam.id] || 0
    }));

    res.status(200).json(examsWithStats);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Some error occurred while retrieving exams."
    });
  }
};

// Get a single exam by ID
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const exam = await Exams.findByPk(id);
    
    // Số luong câu hỏi trong bài thi
    const questionCount = await Questions.count({
      where: { examId: id }
    });
    
    if (!exam) {
      return res.status(404).json({
        message: `Exam with id ${id} not found.`
      });
    }
    
    res.status(200).json({
      data: exam,
      questionCount: questionCount
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error retrieving exam."
    });
  }
};

// Create a new exam
exports.create = async (req, res) => {
  try {
    const { title, category, level, description, isApproved, accountId } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({
        message: "Title is required!"
      });
    }
    
    if (!accountId) {
      return res.status(400).json({
        message: "Account ID is required!"
      });
    }
    
    // Create exam
    const exam = await Exams.create({
      title,
      category,
      level,
      description,
      isApproved,
      accountId
    });
    
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Some error occurred while creating the exam."
    });
  }
};

// Update an exam
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    const [updated] = await Exams.update(req.body, {
      where: { id: id }
    });
    
    if (updated === 0) {
      return res.status(404).json({
        message: `Exam with id ${id} not found.`
      });
    }
    
    res.status(200).json({
      message: "Exam updated successfully."
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error updating exam."
    });
  }
};

// Delete an exam
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    const deleted = await Exams.destroy({
      where: { id: id }
    });
    
    if (deleted === 0) {
      return res.status(404).json({
        message: `Exam with id ${id} not found.`
      });
    }
    
    res.status(200).json({
      message: "Exam deleted successfully."
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error deleting exam."
    });
  }
};

// Get exams by account ID
exports.findByAccountId = async (req, res) => {
  try {
    const accountId = req.params.accountId;
    
    const exams = await Exams.findAll({
      where: { accountId: accountId }
    });
    
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error retrieving exams for account."
    });
  }
};

// Approve an exam
exports.approve = async (req, res) => {
  try {
    const id = req.params.id;
    
    const [updated] = await Exams.update(
      { isApproved: true },
      { where: { id: id } }
    );
    
    if (updated === 0) {
      return res.status(404).json({
        message: `Exam with id ${id} not found.`
      });
    }
    
    res.status(200).json({
      message: "Exam approved successfully."
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error approving exam."
    });
  }
};