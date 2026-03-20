const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Usuario = require("./Usuario");

const Pedido = sequelize.define("Pedido", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  total: { type: DataTypes.FLOAT, allowNull: false },
  metodo_pago: { type: DataTypes.ENUM("transferencia", "efectivo"), allowNull: false },
  pago_envio: { type: DataTypes.BOOLEAN, defaultValue: false },

  estado: { 
    type: DataTypes.STRING(20), 
    allowNull: false,
    defaultValue: "pendiente"
  },

  usuario_id: { type: DataTypes.INTEGER, allowNull: true }
});

module.exports = Pedido;
