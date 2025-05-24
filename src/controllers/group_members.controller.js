const {models} = require('../config/db.config'); 
const GroupMembers = models.group_members;
const GroupStudy = models.group_study;
const { Op } = require('sequelize');

// Thêm thành viên vào nhóm
exports.addMember = async (req, res) => {
  try {
    // Lấy dữ liệu từ request body
    const { groupId, accountId } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!groupId) {
      return res.status(400).send({
        message: "ID nhóm không được để trống!"
      });
    }

    if (!accountId) {
      return res.status(400).send({
        message: "ID tài khoản không được để trống!"
      });
    }

    // Kiểm tra nhóm có tồn tại không
    const group = await GroupStudy.findByPk(groupId);
    if (!group) {
      return res.status(404).send({
        message: `Không tìm thấy nhóm với ID: ${groupId}`
      });
    }

    // Kiểm tra thành viên đã tồn tại trong nhóm chưa
    const existingMember = await GroupMembers.findOne({
      where: {
        groupId,
        accountId
      }
    });

    if (existingMember) {
      return res.status(400).send({
        message: "Thành viên đã tồn tại trong nhóm!"
      });
    }

    // Thêm thành viên vào nhóm
    const member = await GroupMembers.create({
      groupId,
      accountId
    });

    return res.status(201).send({
      message: "Đã thêm thành viên vào nhóm thành công!",
      member
    });
  } catch (error) {
    // Xử lý lỗi foreign key
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).send({
        message: "GroupId hoặc AccountId không tồn tại trong hệ thống!"
      });
    }
    return res.status(500).send({
      message: "Đã xảy ra lỗi khi thêm thành viên vào nhóm: " + error.message
    });
  }
};

// Lấy tất cả thành viên của một nhóm
exports.getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, size = 10 } = req.query;
    const limit = parseInt(size);
    const offset = (parseInt(page) - 1) * limit;

    // Kiểm tra nhóm có tồn tại không
    const group = await GroupStudy.findByPk(groupId);
    if (!group) {
      return res.status(404).send({
        message: `Không tìm thấy nhóm với ID: ${groupId}`
      });
    }

    // Lấy danh sách thành viên
    const data = await GroupMembers.findAndCountAll({
      where: { groupId },
      limit,
      offset,
      order: [['joinedAt', 'DESC']]
    });

    return res.send({
      totalItems: data.count,
      members: data.rows,
      totalPages: Math.ceil(data.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    return res.status(500).send({
      message: "Đã xảy ra lỗi khi lấy danh sách thành viên nhóm: " + error.message
    });
  }
};

// Kiểm tra thành viên có trong nhóm không
exports.checkMembership = async (req, res) => {
  try {
    const { groupId, accountId } = req.params;

    // Kiểm tra nhóm có tồn tại không
    const group = await GroupStudy.findByPk(groupId);
    if (!group) {
      return res.status(404).send({
        message: `Không tìm thấy nhóm với ID: ${groupId}`
      });
    }

    // Kiểm tra thành viên có trong nhóm không
    const member = await GroupMembers.findOne({
      where: {
        groupId,
        accountId
      }
    });

    if (!member) {
      return res.status(404).send({
        message: "Tài khoản này không phải thành viên của nhóm!",
        isMember: false
      });
    }

    return res.send({
      message: "Tài khoản là thành viên của nhóm!",
      isMember: true,
      member
    });
  } catch (error) {
    return res.status(500).send({
      message: "Đã xảy ra lỗi khi kiểm tra thành viên nhóm: " + error.message
    });
  }
};

// Lấy tất cả nhóm mà một tài khoản là thành viên
exports.getMemberGroups = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { page = 1, size = 10 } = req.query;
    const limit = parseInt(size);
    const offset = (parseInt(page) - 1) * limit;

    // Đếm tổng số nhóm
    const count = await GroupMembers.count({
      where: { accountId }
    });

    // Lấy danh sách nhóm kèm thông tin chi tiết
    const members = await GroupMembers.findAll({
      where: { accountId },
      limit,
      offset,
      order: [['joinedAt', 'DESC']],
      include: [
        {
          model: GroupStudy,
          as: 'group',
          attributes: ['id', 'groupName', 'accountId', 'createdAt', 'updatedAt']
        }
      ]
    });

    return res.send({
      totalItems: count,
      groups: members,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    return res.status(500).send({
      message: "Đã xảy ra lỗi khi lấy danh sách nhóm của thành viên: " + error.message
    });
  }
};

// Xóa thành viên khỏi nhóm
exports.removeMember = async (req, res) => {
  try {
    const { groupId, accountId } = req.params;

    // Kiểm tra nhóm có tồn tại không
    const group = await GroupStudy.findByPk(groupId);
    if (!group) {
      return res.status(404).send({
        message: `Không tìm thấy nhóm với ID: ${groupId}`
      });
    }

    // Kiểm tra người dùng là chủ nhóm không
    if (group.accountId === accountId) {
      return res.status(400).send({
        message: "Không thể xóa chủ nhóm khỏi nhóm! Hãy chuyển quyền sở hữu trước khi rời nhóm."
      });
    }

    // Kiểm tra thành viên có trong nhóm không
    const member = await GroupMembers.findOne({
      where: {
        groupId,
        accountId
      }
    });

    if (!member) {
      return res.status(404).send({
        message: "Thành viên không tồn tại trong nhóm!"
      });
    }

    // Xóa thành viên khỏi nhóm
    await GroupMembers.destroy({
      where: {
        groupId,
        accountId
      }
    });

    return res.send({
      message: "Đã xóa thành viên khỏi nhóm thành công!"
    });
  } catch (error) {
    return res.status(500).send({
      message: "Đã xảy ra lỗi khi xóa thành viên khỏi nhóm: " + error.message
    });
  }
};

// Lấy số lượng thành viên của một nhóm
exports.countGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Kiểm tra nhóm có tồn tại không
    const group = await GroupStudy.findByPk(groupId);
    if (!group) {
      return res.status(404).send({
        message: `Không tìm thấy nhóm với ID: ${groupId}`
      });
    }

    // Đếm số lượng thành viên
    const count = await GroupMembers.count({
      where: { groupId }
    });

    return res.send({
      groupId,
      memberCount: count
    });
  } catch (error) {
    return res.status(500).send({
      message: "Đã xảy ra lỗi khi đếm số lượng thành viên nhóm: " + error.message
    });
  }
};