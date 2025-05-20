const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "refresh_tokens",
    {
      id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        defaultValue: Sequelize.Sequelize.fn("uuid"),
        primaryKey: true,
      },
      accountId: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        references: {
          model: "accounts",
          key: "id",
        },
      },
      token: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      isRevoked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      sequelize,
      tableName: "refresh_tokens",
      timestamps: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "token",
          unique: true,
          using: "BTREE",
          fields: [{ name: "token" }],
        },
        {
          name: "accountId",
          using: "BTREE",
          fields: [{ name: "accountId" }],
        },
      ],
    }
  );
};
