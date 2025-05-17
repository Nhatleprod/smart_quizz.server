const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('exam_attempts', {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
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
    score: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    attemptDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'exam_attempts',
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
