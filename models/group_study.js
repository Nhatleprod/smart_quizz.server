const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('group_study', {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    groupName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "groupName"
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
    tableName: 'group_study',
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
        name: "groupName",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "groupName" },
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
