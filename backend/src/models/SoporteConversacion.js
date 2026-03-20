const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SoporteConversacion = sequelize.define("SoporteConversacion", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  cliente_id: { type: DataTypes.INTEGER, allowNull: false },
  estado: {
    type: DataTypes.ENUM("abierto", "cerrado"),
    allowNull: false,
    defaultValue: "abierto"
  }
});

module.exports = SoporteConversacion;

