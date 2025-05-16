const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('comments', {
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
      }
    },
    examId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'exams',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'comments',
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
      {
        name: "examId",
        using: "BTREE",
        fields: [
          { name: "examId" },
        ]
      },
    ]
  });
};
