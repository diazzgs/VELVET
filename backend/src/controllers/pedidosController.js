const { Pedido, PedidoDetalle, Producto } = require("../models");


exports.crearPedido = async (req, res) => {
  try {
    const { items, metodo_pago, pago_envio } = req.body;

    let total = 0;
    for (const item of items) {
      const prod = await Producto.findByPk(item.producto_id);
      total += prod.precio * item.cantidad;
    }

    const pedido = await Pedido.create({
      usuario_id: req.user.id,
      total,
      metodo_pago,
      pago_envio
    });

    for (const item of items) {
      const prod = await Producto.findByPk(item.producto_id);
      await PedidoDetalle.create({
        pedido_id: pedido.id,
        producto_id: prod.id,
        cantidad: item.cantidad,
        precio_unitario: prod.precio
      });
    }

    res.json(pedido);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};


exports.listarPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      include: [
        {
          model: PedidoDetalle,
          include: [{ model: Producto }]
        },
        {
          model: require("../models").Usuario, 
          attributes: ["id", "nombre", "email"] 
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json(pedidos);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};


exports.misPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      where: { usuario_id: req.user.id },
      include: [
        {
          model: PedidoDetalle,
          include: [{ model: Producto }]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json(pedidos);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};


exports.actualizarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const { id } = req.params;

    const estadosValidos = ["pendiente", "procesado", "completado"];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ msg: "Estado inválido" });
    }

    const pedido = await Pedido.findByPk(id, {
      include: [
        {
          model: PedidoDetalle,
          include: [Producto]
        }
      ]
    });

    if (!pedido) {
      return res.status(404).json({ msg: "Pedido no encontrado" });
    }

    
    if (pedido.estado === "completado") {
      return res.status(400).json({ msg: "Este pedido ya fue completado y no puede modificarse." });
    }

    
    if (estado === "completado") {

      
      for (const det of pedido.PedidoDetalles) {
        const prod = det.Producto;

        if (!prod) {
          return res.status(400).json({
            msg: `Uno de los productos del pedido ya no existe.`
          });
        }

        if (prod.stock < det.cantidad) {
          return res.status(400).json({
            msg: `Stock insuficiente del producto "${prod.nombre}". Disponible: ${prod.stock}, solicitado: ${det.cantidad}`
          });
        }
      }

      
      for (const det of pedido.PedidoDetalles) {
        const prod = det.Producto;
        prod.stock -= det.cantidad;
        await prod.save();
      }
    }

  
    
   
    pedido.estado = estado;
    await pedido.save();

    res.json({ ok: true, msg: "Estado actualizado con éxito", pedido });

  } catch (e) {
    console.error("ERROR actualizarEstado:", e);
    res.status(500).json({ error: e.message });
  }
};



exports.estadisticas = async (req, res) => {
  try {
    const { Sequelize } = require("sequelize");
    const Op = Sequelize.Op;

    const hoy = new Date();
    const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioAno = new Date(hoy.getFullYear(), 0, 1);

    
    const completados = await Pedido.findAll({
      where: { estado: "completado" },
      include: [{ model: PedidoDetalle }]
    });

    let totalGeneral = 0;
    let productosVendidos = 0;

    completados.forEach(p => {
      totalGeneral += Number(p.total);
      p.PedidoDetalles.forEach(d => productosVendidos += d.cantidad);
    });

    
    const hoyPedidos = completados.filter(p => p.createdAt >= inicioDia);
    const totalHoy = hoyPedidos.reduce((sum, p) => sum + Number(p.total), 0);

   
    const mesPedidos = completados.filter(p => p.createdAt >= inicioMes);
    const totalMes = mesPedidos.reduce((sum, p) => sum + Number(p.total), 0);

    
    const anoPedidos = completados.filter(p => p.createdAt >= inicioAno);
    const totalAno = anoPedidos.reduce((sum, p) => sum + Number(p.total), 0);

    res.json({
      totalGeneral,
      totalHoy,
      totalMes,
      totalAno,
      pedidosCompletados: completados.length,
      productosVendidos
    });

  } catch (e) {
    console.error("ERROR ESTADISTICAS:", e);
    res.status(500).json({ error: e.message });
  }
};
