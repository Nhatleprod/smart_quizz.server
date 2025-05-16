const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    accountId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'id'
      },
      unique: "users_ibfk_1"
    },
    fullName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: "phoneNumber"
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('male','female','other'),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'users',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "accountId",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "accountId" },
        ]
      },
      {
        name: "phoneNumber",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "phoneNumber" },
        ]
      },
    ]
  });
};
