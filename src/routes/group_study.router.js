const express = require('express');
const router = express.Router();
const groupStudyController = require('../controllers/group_study.controller');

// Tạo nhóm học tập mới
router.post('/', groupStudyController.createGroup);

// Lấy tất cả nhóm học tập với khả năng lọc và phân trang
router.get('/', groupStudyController.getAllGroups);

// Lấy nhóm học tập theo ID
router.get('/:id', groupStudyController.getGroupById);

// Lấy nhóm học tập theo accountId (các nhóm của một người dùng)
router.get('/account/:accountId', groupStudyController.getGroupsByAccountId);

// Cập nhật thông tin nhóm học tập
router.put('/:id', groupStudyController.updateGroup);

// Chuyển quyền sở hữu nhóm học tập
router.put('/:id/transfer', groupStudyController.transferOwnership);

// Xóa nhóm học tập
router.delete('/:id', groupStudyController.deleteGroup);

module.exports = router;