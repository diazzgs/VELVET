const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PedidoDetalle = sequelize.define("PedidoDetalle", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  pedido_id: { type: DataTypes.INTEGER, allowNull: false },
  producto_id: { type: DataTypes.INTEGER, allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  precio_unitario: { type: DataTypes.FLOAT, allowNull: false }
});

module.exports = PedidoDetalle;
