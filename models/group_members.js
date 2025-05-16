const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('group_members', {
    groupId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'group_study',
        key: 'id'
      }
    },
    accountId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'accounts',
        key: 'id'
      }
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'group_members',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "groupId" },
          { name: "accountId" },
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
