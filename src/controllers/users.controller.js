const {models} = require('../config/db.config');
const Users = models.users;
const { Op } = require('sequelize');

// Tạo một người dùng mới
exports.createUser = async (req, res) => {
    try {
        // lấy dữ liệu từ request body
        const { accountId, fullName, phoneNumber, dateOfBirth, gender } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!accountId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc'
            });
        }

        // Tạo người dùng mới
        const newUser = await Users.create({
            accountId,
            fullName,
            phoneNumber,
            dateOfBirth,
            gender
        });

        // trả về người dùng đã tạo
        return res.status(201).json({
            success: true,
            message: 'Tạo người dùng thành công',
            data: newUser
        });
    } catch (error) {
        // Xử lý lỗi unique constraint
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Thông tin đã tồn tại, vui lòng kiểm tra lại accountId hoặc phoneNumber của bạn',
                error: error.errors[0].message
            });
        }
        // Xử lý lỗi foreign key constraint
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'accountId không tồn tại trong bảng accounts',
                error: error.message
            });
        }
        // Xử lý lỗi khác
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi tạo người dùng',
            error: error.message
        });
    }
};

// Lấy tất cả người dùng
exports.getAllUsers = async (req, res) => {
    try {
        // Lấy tất cả người dùng từ DB
        const users = await Users.findAll();

        // Trả về danh sách người dùng
        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách người dùng thành công',
            data: users
        });
    } catch (error) {
        // Xử lý lỗi
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy danh sách người dùng',
            error: error.message
        });
    }
};

// Lấy người dùng theo ID
exports.getUserById = async (req, res) => {
    try {
        // Lấy ID từ tham số URL
        const { id } = req.params;

        // Tìm người dùng theo ID
        const user = await Users.findByPk(id);

        // Nếu không tìm thấy người dùng
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Người dùng không tồn tại'
            });
        }

        // Trả về thông tin người dùng
        return res.status(200).json({
            success: true,
            message: 'Lấy thông tin người dùng thành công',
            data: user
        });
    } catch (error) {
        // Xử lý lỗi
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy thông tin người dùng',
            error: error.message
        });
    }
};

// Cập nhật người dùng
exports.updateUser = async (req, res) => {
    try {
        // Lấy ID từ tham số URL
        const { id } = req.params;

        // Tìm người dùng theo ID
        const user = await Users.findByPk(id);

        // Nếu không tìm thấy người dùng
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Người dùng không tồn tại'
            });
        }
        
        // Lấy dữ liệu từ request body
        const { fullName, phoneNumber, dateOfBirth, gender } = req.body;
        // Cập nhật thông tin người dùng
        await Users.update({
            fullName,
            phoneNumber,
            dateOfBirth,
            gender
            }, {
            where: { id }
        });

        // Trả về thông tin người dùng đã cập nhật
        const updatedUser = await Users.findByPk(id);
        return res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin người dùng thành công',
            data: updatedUser
        });
    } catch (error) {
        // Xử lý lỗi unique constraint
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Thông tin số điện thoại đã tồn tại, vui lòng kiểm tra lại',
                error: error.errors[0].message
            });
        }
        // Xử lý lỗi
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi cập nhật thông tin người dùng',
            error: error.message
        });
    }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
    try {
        // Lấy ID từ tham số URL
        const { id } = req.params;

        // Tìm người dùng theo ID
        const user = await Users.findByPk(id);

        // Nếu không tìm thấy người dùng
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Người dùng không tồn tại'
            });
        }

        // Xóa người dùng
        await Users.destroy({
            where: { id }
        });

        // Trả về thông báo thành công
        return res.status(200).json({
            success: true,
            message: 'Xóa người dùng thành công'
        });
    } catch (error) {
        // Xử lý lỗi
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi xóa người dùng',
            error: error.message
        });
    }
};