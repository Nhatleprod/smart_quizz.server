const { models } = require("../config/db.config");
const Exams = models.exams;
const { Op } = require("sequelize");

// Get all exams with optional filtering
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
      filter.isApproved = isApproved === "true";
    }

    const exams = await Exams.findAll({ where: filter });

    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Some error occurred while retrieving exams.",
    });
  }
};

// Get a single exam by ID
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    const exam = await Exams.findByPk(id);

    if (!exam) {
      return res.status(404).json({
        message: `Exam with id ${id} not found.`,
      });
    }

    res.status(200).json(exam);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error retrieving exam.",
    });
  }
};

// Create a new exam
exports.create = async (req, res) => {
  try {
    const { title, category, level, description, isApproved, accountId } =
      req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        message: "Title is required!",
      });
    }

    if (!accountId) {
      return res.status(400).json({
        message: "Account ID is required!",
      });
    }

    // Create exam
    const exam = await Exams.create({
      title,
      category,
      level,
      description,
      isApproved,
      accountId,
    });

    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Some error occurred while creating the exam.",
    });
  }
};

// Update an exam
exports.update = async (req, res) => {
  try {
    const id = req.params.id;

    const [updated] = await Exams.update(req.body, {
      where: { id: id },
    });

    if (updated === 0) {
      return res.status(404).json({
        message: `Exam with id ${id} not found.`,
      });
    }

    res.status(200).json({
      message: "Exam updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error updating exam.",
    });
  }
};

// Delete an exam
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    const deleted = await Exams.destroy({
      where: { id: id },
    });

    if (deleted === 0) {
      return res.status(404).json({
        message: `Exam with id ${id} not found.`,
      });
    }

    res.status(200).json({
      message: "Exam deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error deleting exam.",
    });
  }
};

// Get exams by account ID
exports.findByAccountId = async (req, res) => {
  try {
    const accountId = req.params.accountId;

    const exams = await Exams.findAll({
      where: { accountId: accountId },
    });

    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error retrieving exams for account.",
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
        message: `Exam with id ${id} not found.`,
      });
    }

    res.status(200).json({
      message: "Exam approved successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error approving exam.",
    });
  }
};
