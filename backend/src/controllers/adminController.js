const { Usuario, Pedido, PedidoDetalle, Producto, sequelize } = require("../models");
const { Op } = require("sequelize");

exports.listarClientes = async (req, res) => {
  try {
    const clientes = await Usuario.findAll({
      where: { rol: "cliente" },
      attributes: ["id", "nombre", "email", "telefono", "direccion", "createdAt", "updatedAt"],
      order: [["createdAt", "DESC"]]
    });
    res.json(clientes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Usuario.findByPk(id);
    if (!cliente) return res.status(404).json({ msg: "Cliente no encontrado" });
    if (cliente.rol !== "cliente") return res.status(400).json({ msg: "Solo se pueden borrar clientes" });

    // Nota: por simplicidad borramos el usuario. Si hay FK en tu DB,
    // podrías cambiarlo a "desactivar" en lugar de destroy().
    await cliente.destroy();
    res.json({ ok: true, msg: "Cliente eliminado" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.pedidosDeCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const pedidos = await Pedido.findAll({
      where: { usuario_id: id },
      include: [
        { model: PedidoDetalle, include: [{ model: Producto }] }
      ],
      order: [["createdAt", "DESC"]]
    });
    res.json(pedidos);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.dashboardResumen = async (req, res) => {
  try {
    // Últimas ventas: pedidos completados recientes
    const ultimasVentas = await Pedido.findAll({
      where: { estado: "completado" },
      include: [
        { model: Usuario, attributes: ["id", "nombre", "email"] },
        { model: PedidoDetalle, include: [{ model: Producto }] }
      ],
      order: [["createdAt", "DESC"]],
      limit: 8
    });

    // Queries agregadas: usamos SQL directo para evitar problemas de GROUP BY en MySQL.
    const tPedidos = Pedido.getTableName();
    const tDetalles = PedidoDetalle.getTableName();
    const tProductos = Producto.getTableName();
    const tUsuarios = Usuario.getTableName();

    const [topProductosRows] = await sequelize.query(
      `
      SELECT
        d.producto_id AS producto_id,
        SUM(d.cantidad) AS vendidos,
        SUM(d.cantidad * d.precio_unitario) AS ingreso,
        p.id AS p_id, p.nombre AS p_nombre, p.marca AS p_marca, p.imagen AS p_imagen, p.precio AS p_precio
      FROM \`${tDetalles}\` d
      INNER JOIN \`${tPedidos}\` pe ON pe.id = d.pedido_id
      INNER JOIN \`${tProductos}\` p ON p.id = d.producto_id
      WHERE pe.estado = 'completado'
      GROUP BY d.producto_id, p.id, p.nombre, p.marca, p.imagen, p.precio
      ORDER BY vendidos DESC
      LIMIT 6
      `
    );

    const topProductos = (topProductosRows || []).map(r => ({
      producto_id: r.producto_id,
      vendidos: Number(r.vendidos || 0),
      ingreso: Number(r.ingreso || 0),
      Producto: {
        id: r.p_id,
        nombre: r.p_nombre,
        marca: r.p_marca,
        imagen: r.p_imagen,
        precio: r.p_precio
      }
    }));

    const [topClientesRows] = await sequelize.query(
      `
      SELECT
        pe.usuario_id AS usuario_id,
        SUM(pe.total) AS gastado,
        COUNT(pe.id) AS pedidos,
        u.id AS u_id, u.nombre AS u_nombre, u.email AS u_email
      FROM \`${tPedidos}\` pe
      INNER JOIN \`${tUsuarios}\` u ON u.id = pe.usuario_id
      WHERE pe.estado = 'completado'
      GROUP BY pe.usuario_id, u.id, u.nombre, u.email
      ORDER BY gastado DESC
      LIMIT 6
      `
    );

    const topClientes = (topClientesRows || []).map(r => ({
      usuario_id: r.usuario_id,
      gastado: Number(r.gastado || 0),
      pedidos: Number(r.pedidos || 0),
      Usuario: { id: r.u_id, nombre: r.u_nombre, email: r.u_email }
    }));

    // Clientes activos: últimos con pedidos (cualquier estado) en los últimos 30 días
    // Usamos SQL directo para evitar ambigüedad en createdAt (Pedido vs Usuario).
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [activosRows] = await sequelize.query(
      `
      SELECT
        pe.usuario_id AS usuario_id,
        MAX(pe.createdAt) AS ultima_compra,
        u.id AS u_id, u.nombre AS u_nombre, u.email AS u_email
      FROM \`${tPedidos}\` pe
      INNER JOIN \`${tUsuarios}\` u ON u.id = pe.usuario_id
      WHERE pe.createdAt >= :since
      GROUP BY pe.usuario_id, u.id, u.nombre, u.email
      ORDER BY ultima_compra DESC
      LIMIT 8
      `,
      { replacements: { since } }
    );

    const clientesActivos = (activosRows || []).map(r => ({
      usuario_id: r.usuario_id,
      ultima_compra: r.ultima_compra,
      Usuario: { id: r.u_id, nombre: r.u_nombre, email: r.u_email }
    }));

    res.json({
      ultimasVentas,
      topProductos,
      topClientes,
      clientesActivos
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

