const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('admins', {
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
      unique: "admins_ibfk_1"
    },
    permissionLevel: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'admins',
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
    ]
  });
};
