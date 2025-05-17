const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('exams', {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    level: {
      type: DataTypes.ENUM('easy','medium','hard'),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    accountId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'exams',
    timestamps: true,
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
        using: "BTREE",
        fields: [
          { name: "accountId" },
        ]
      },
    ]
  });
};
