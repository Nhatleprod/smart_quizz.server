const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('exam_attempt_details', {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    examAttemptId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'exam_attempts',
        key: 'id'
      }
    },
    questionId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id'
      }
    },
    answerId: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'answers',
        key: 'id'
      }
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'exam_attempt_details',
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
        name: "examAttemptId",
        using: "BTREE",
        fields: [
          { name: "examAttemptId" },
        ]
      },
      {
        name: "questionId",
        using: "BTREE",
        fields: [
          { name: "questionId" },
        ]
      },
      {
        name: "answerId",
        using: "BTREE",
        fields: [
          { name: "answerId" },
        ]
      },
    ]
  });
};
