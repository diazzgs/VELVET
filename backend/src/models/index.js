const sequelize = require("../config/db");

const Usuario = require("./Usuario");
const Producto = require("./Producto");
const Categoria = require("./Categoria");
const Pedido = require("./Pedido");
const PedidoDetalle = require("./PedidoDetalle");
const SoporteConversacion = require("./SoporteConversacion");
const SoporteMensaje = require("./SoporteMensaje");

// Relaciones
Categoria.hasMany(Producto, { foreignKey: "categoria_id" });
Producto.belongsTo(Categoria, { foreignKey: "categoria_id" });

Usuario.hasMany(Pedido, { foreignKey: "usuario_id" });
Pedido.belongsTo(Usuario, { foreignKey: "usuario_id" });

Pedido.hasMany(PedidoDetalle, { foreignKey: "pedido_id" });
PedidoDetalle.belongsTo(Pedido, { foreignKey: "pedido_id" });

Producto.hasMany(PedidoDetalle, { foreignKey: "producto_id" });
PedidoDetalle.belongsTo(Producto, { foreignKey: "producto_id" });

// Soporte (cliente <-> admin)
Usuario.hasMany(SoporteConversacion, { foreignKey: "cliente_id" });
SoporteConversacion.belongsTo(Usuario, { foreignKey: "cliente_id" });

SoporteConversacion.hasMany(SoporteMensaje, { foreignKey: "conversacion_id" });
SoporteMensaje.belongsTo(SoporteConversacion, { foreignKey: "conversacion_id" });

Usuario.hasMany(SoporteMensaje, { foreignKey: "sender_id" });
SoporteMensaje.belongsTo(Usuario, { foreignKey: "sender_id" });

module.exports = {
  sequelize,
  Usuario,
  Producto,
  Categoria,
  Pedido,
  PedidoDetalle,
  SoporteConversacion,
  SoporteMensaje
};
