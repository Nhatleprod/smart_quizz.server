const express = require('express');
const router = express.Router();
const groupMembersController = require('../controllers/group_members.controller');

// Thêm thành viên vào nhóm
router.post('/', groupMembersController.addMember);

// Lấy tất cả thành viên của một nhóm
router.get('/group/:groupId', groupMembersController.getGroupMembers);

// Kiểm tra thành viên có trong nhóm không
router.get('/check/:groupId/:accountId', groupMembersController.checkMembership);

// Lấy tất cả nhóm mà một tài khoản là thành viên
router.get('/account/:accountId', groupMembersController.getMemberGroups);

// Đếm số lượng thành viên của một nhóm
router.get('/count/:groupId', groupMembersController.countGroupMembers);

// Xóa thành viên khỏi nhóm
router.delete('/:groupId/:accountId', groupMembersController.removeMember);

module.exports = router;