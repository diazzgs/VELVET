const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SoporteMensaje = sequelize.define("SoporteMensaje", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  conversacion_id: { type: DataTypes.INTEGER, allowNull: false },
  sender_id: { type: DataTypes.INTEGER, allowNull: false },
  sender_rol: {
    type: DataTypes.ENUM("cliente", "admin"),
    allowNull: false
  },
  mensaje: { type: DataTypes.TEXT, allowNull: false }
});

module.exports = SoporteMensaje;

