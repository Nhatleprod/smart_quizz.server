const {models} = require('../config/db.config'); 
const Admins = models.admins;
const { Op } = require('sequelize');

// Tạo một admin mới
exports.createAdmin = async (req, res) => {
  try {
    // Lấy dữ liệu từ request body
    const { accountId, permissionLevel } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!accountId) {
      return res.status(400).send({
        success: false,
        message: "accountId không được để trống!"
      });
    }

    // Tạo admin mới
    const admin = await Admins.create({
      success: true,
      accountId,
      permissionLevel: permissionLevel || 1
    });

    return res.status(201).send({
      message: "Admin đã được tạo thành công!",
      admin
    });
  } catch (error) {
    // Xử lý lỗi unique constraint
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).send({
        success: false,
        message: "Đã tồn tại admin với accountId này!",
        error: error.errors[0].message
      });
    }
    // Xử lý lỗi foreign key
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).send({
        success: false,
        message: "accountId không tồn tại trong bảng accounts!",
        error: error.message
      });
    }
    return res.status(500).send({
      success: false,
      message: "Đã xảy ra lỗi khi tạo admin: " + error.message
    });
  }
};

// Lấy tất cả admin
exports.getAllAdmins = async (req, res) => {
    try {
        // Lấy tất cả admin
        const admins = await Admins.findAll();
        
        if (admins.length === 0) {
        return res.status(404).send({
            success: false,
            message: "Không tìm thấy admin nào!"
        });
        }
    
        return res.send(admins);
    } catch (error) {
        return res.status(500).send({
        success: false,
        message: "Đã xảy ra lỗi khi lấy danh sách admin: " + error.message
        });
    }
};

// Lấy admin theo ID
exports.getAdminById = async (req, res) => {
  try {
    const id = req.params.id;

    // Tìm admin theo ID
    const admin = await Admins.findByPk(id);
    
    if (!admin) {
      return res.status(404).send({
        success: false,
        message: `Không tìm thấy admin với ID: ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin admin thành công!",
      data: admin
    });

  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Đã xảy ra lỗi khi lấy thông tin admin: " + error.message
    });
  }
};

// Lấy admin theo accountId
exports.getAdminByAccountId = async (req, res) => {
  try {
    const accountId = req.params.accountId;

    // Tìm admin theo accountId
    const admin = await Admins.findOne({
      where: { accountId }
    });
    
    if (!admin) {
      return res.status(404).send({
        message: `Không tìm thấy admin với accountId: ${accountId}`
      });
    }

    return res.status(200).json({
      message: "Lấy thông tin admin thành công!",
      data: admin
    });

  } catch (error) {
    return res.status(500).send({
      message: "Đã xảy ra lỗi khi lấy thông tin admin: " + error.message
    });
  }
};

// Cập nhật admin
exports.updateAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Kiểm tra admin tồn tại
    const admin = await Admins.findByPk(id);
    if (!admin) {
      return res.status(404).send({
        message: `Không tìm thấy admin với ID: ${id}`
      });
    }

    // Cập nhật thông tin admin
    const { permissionLevel } = req.body;
    
    // Thực hiện cập nhật
    await Admins.update({
      permissionLevel
    }, {
      where: { id }
    });

    // Trả về thông tin admin sau khi cập nhật
    const updatedAdmin = await Admins.findByPk(id);
    return res.status(200).json({
      message: "Admin đã được cập nhật thành công!",
      data: updatedAdmin
    });
  } catch (error) {
    return res.status(500).send({
      message: "Đã xảy ra lỗi khi cập nhật admin: " + error.message
    });
  }
};

// Xóa admin
exports.deleteAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Kiểm tra admin tồn tại
    const admin = await Admins.findByPk(id);
    if (!admin) {
      return res.status(404).send({
        message: `Không tìm thấy admin với ID: ${id}`
      });
    }

    // Thực hiện xóa
    await Admins.destroy({
      where: { id }
    });

    return res.send({
      success: true,
      message: "Admin đã được xóa thành công!"
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Đã xảy ra lỗi khi xóa admin: " + error.message
    });
  }
};