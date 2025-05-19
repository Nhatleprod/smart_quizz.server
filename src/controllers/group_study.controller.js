const {models} = require('../config/db.config'); 
const GroupStudy = models.group_study;
const { Op } = require('sequelize');

// Tạo một nhóm học tập mới
exports.createGroup = async (req, res) => {
  try {
    // Lấy dữ liệu từ request body
    const { groupName, accountId } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!groupName) {
      return res.status(400).send({
        message: "Tên nhóm không được để trống!"
      });
    }

    if (!accountId) {
      return res.status(400).send({
        message: "ID tài khoản người tạo không được để trống!"
      });
    }

    // Tạo nhóm học tập mới
    const group = await GroupStudy.create({
      groupName,
      accountId
    });

    // Trả về nhóm đã tạo
    return res.status(201).send(group);
  } catch (error) {
    // Xử lý lỗi unique constraint
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).send({
        message: "Tên nhóm đã tồn tại, vui lòng chọn tên khác!"
      });
    }
    // Xử lý lỗi foreign key
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).send({
        message: "accountId không tồn tại trong hệ thống!"
      });
    }
    return res.status(500).send({
      message: "Đã xảy ra lỗi khi tạo nhóm học tập: " + error.message
    });
  }
};

// Lấy tất cả nhóm học tập
exports.getAllGroups = async (req, res) => {
  try {
    // Xử lý phân trang và tìm kiếm
    const { page = 1, size = 10, groupName, accountId } = req.query;
    const limit = parseInt(size);
    const offset = (parseInt(page) - 1) * limit;
    
    // Xây dựng điều kiện tìm kiếm
    const condition = {};
    if (groupName) {
      condition.groupName = { [Op.like]: `%${groupName}%` };
    }
    if (accountId) {
      condition.accountId = accountId;
    }

    // Truy vấn dữ liệu
    const data = await GroupStudy.findAndCountAll({
      where: condition,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    // Trả về kết quả
    return res.send({
      totalItems: data.count,
      groups: data.rows,
      totalPages: Math.ceil(data.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    return res.status(500).send({
      message: "Đã xảy ra lỗi khi lấy danh sách nhóm học tập: " + error.message
    });
  }
};

// Lấy nhóm học tập theo ID
exports.getGroupById = async (req, res) => {
  try {
    const id = req.params.id;

    // Tìm nhóm theo ID
    const group = await GroupStudy.findByPk(id);
    
    if (!group) {
      return res.status(404).send({
        message: `Không tìm thấy nhóm học tập với ID: ${id}`
      });
    }

    return res.send(group);
  } catch (error) {
    return res.status(500).send({
      message: "Đã xảy ra lỗi khi lấy thông tin nhóm học tập: " + error.message
    });
  }
};

// Lấy nhóm học tập của một người dùng
exports.getGroupsByAccountId = async (req, res) => {
  try {
    const accountId = req.params.accountId;
    const { page = 1, size = 10 } = req.query;
    const limit = parseInt(size);
    const offset = (parseInt(page) - 1) * limit;

    // Tìm tất cả nhóm của một người dùng
    const data = await GroupStudy.findAndCountAll({
      where: { accountId },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    return res.send({
      totalItems: data.count,
      groups: data.rows,
      totalPages: Math.ceil(data.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    return res.status(500).send({
      message: "Đã xảy ra lỗi khi lấy danh sách nhóm học tập: " + error.message
    });
  }
};

// Cập nhật nhóm học tập
exports.updateGroup = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Kiểm tra nhóm tồn tại
    const group = await GroupStudy.findByPk(id);
    if (!group) {
      return res.status(404).send({
        message: `Không tìm thấy nhóm học tập với ID: ${id}`
      });
    }

    // Cập nhật thông tin nhóm
    const { groupName } = req.body;
    
    if (!groupName) {
      return res.status(400).send({
        message: "Tên nhóm không được để trống!"
      });
    }
    
    // Thực hiện cập nhật
    await GroupStudy.update({
      groupName
    }, {
      where: { id }
    });

    // Trả về thông tin nhóm sau khi cập nhật
    const updatedGroup = await GroupStudy.findByPk(id);
    return res.send(updatedGroup);
  } catch (error) {
    // Xử lý lỗi unique constraint
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).send({
        message: "Tên nhóm đã tồn tại, vui lòng chọn tên khác!"
      });
    }
    return res.status(500).send({
      message: "Đã xảy ra lỗi khi cập nhật nhóm học tập: " + error.message
    });
  }
};

// Chuyển quyền sở hữu nhóm
exports.transferOwnership = async (req, res) => {
  try {
    const id = req.params.id;
    const { newAccountId } = req.body;
    
    if (!newAccountId) {
      return res.status(400).send({
        message: "ID tài khoản mới không được để trống!"
      });
    }
    
    // Kiểm tra nhóm tồn tại
    const group = await GroupStudy.findByPk(id);
    if (!group) {
      return res.status(404).send({
        message: `Không tìm thấy nhóm học tập với ID: ${id}`
      });
    }

    // Thực hiện chuyển quyền sở hữu
    await GroupStudy.update({
      accountId: newAccountId
    }, {
      where: { id }
    });

    // Trả về thông tin nhóm sau khi cập nhật
    const updatedGroup = await GroupStudy.findByPk(id);
    return res.send({
      message: "Đã chuyển quyền sở hữu nhóm thành công!",
      group: updatedGroup
    });
  } catch (error) {
    // Xử lý lỗi foreign key
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).send({
        message: "ID tài khoản mới không tồn tại trong hệ thống!"
      });
    }
    return res.status(500).send({
      message: "Đã xảy ra lỗi khi chuyển quyền sở hữu nhóm: " + error.message
    });
  }
};

// Xóa nhóm học tập
exports.deleteGroup = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Kiểm tra nhóm tồn tại
    const group = await GroupStudy.findByPk(id);
    if (!group) {
      return res.status(404).send({
        message: `Không tìm thấy nhóm học tập với ID: ${id}`
      });
    }

    // Thực hiện xóa
    await GroupStudy.destroy({
      where: { id }
    });

    return res.send({
      message: "Nhóm học tập đã được xóa thành công!"
    });
  } catch (error) {
    return res.status(500).send({
      message: "Đã xảy ra lỗi khi xóa nhóm học tập: " + error.message
    });
  }
};