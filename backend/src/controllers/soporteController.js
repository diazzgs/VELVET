const { SoporteConversacion, SoporteMensaje, Usuario } = require("../models");

async function getOrCreateConversacionAbierta(clienteId) {
  let conv = await SoporteConversacion.findOne({
    where: { cliente_id: clienteId, estado: "abierto" },
    order: [["createdAt", "DESC"]]
  });

  if (!conv) {
    conv = await SoporteConversacion.create({
      cliente_id: clienteId,
      estado: "abierto"
    });
  }

  return conv;
}

exports.enviarMensajeCliente = async (req, res) => {
  try {
    const { mensaje } = req.body;
    const texto = String(mensaje || "").trim();

    if (!texto) {
      return res.status(400).json({ msg: "Mensaje requerido" });
    }

    const conv = await getOrCreateConversacionAbierta(req.user.id);

    const m = await SoporteMensaje.create({
      conversacion_id: conv.id,
      sender_id: req.user.id,
      sender_rol: "cliente",
      mensaje: texto
    });

    res.json({ ok: true, conversacion_id: conv.id, mensaje: m });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.misMensajes = async (req, res) => {
  try {
    const clienteId = req.user.id;

    const conv = await SoporteConversacion.findOne({
      where: { cliente_id: clienteId, estado: "abierto" },
      order: [["createdAt", "DESC"]]
    });

    if (!conv) {
      return res.json({ conversacion: null, mensajes: [] });
    }

    const mensajes = await SoporteMensaje.findAll({
      where: { conversacion_id: conv.id },
      include: [{ model: Usuario, attributes: ["id", "nombre", "rol"] }],
      order: [["createdAt", "ASC"]]
    });

    res.json({ conversacion: conv, mensajes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.listarConversacionesAdmin = async (req, res) => {
  try {
    const convs = await SoporteConversacion.findAll({
      include: [{ model: Usuario, attributes: ["id", "nombre", "email"] }],
      order: [["updatedAt", "DESC"], ["createdAt", "DESC"]]
    });

    res.json(convs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.mensajesConversacionAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const conv = await SoporteConversacion.findByPk(id, {
      include: [{ model: Usuario, attributes: ["id", "nombre", "email"] }]
    });

    if (!conv) return res.status(404).json({ msg: "Conversación no encontrada" });

    const mensajes = await SoporteMensaje.findAll({
      where: { conversacion_id: conv.id },
      include: [{ model: Usuario, attributes: ["id", "nombre", "rol"] }],
      order: [["createdAt", "ASC"]]
    });

    res.json({ conversacion: conv, mensajes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.responderAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { mensaje } = req.body;
    const texto = String(mensaje || "").trim();

    if (!texto) return res.status(400).json({ msg: "Mensaje requerido" });

    const conv = await SoporteConversacion.findByPk(id);
    if (!conv) return res.status(404).json({ msg: "Conversación no encontrada" });

    if (conv.estado !== "abierto") {
      return res.status(400).json({ msg: "La conversación está cerrada" });
    }

    const m = await SoporteMensaje.create({
      conversacion_id: conv.id,
      sender_id: req.user.id,
      sender_rol: "admin",
      mensaje: texto
    });

    // fuerza updatedAt para ordenar por actividad
    await conv.update({ updatedAt: new Date() });

    res.json({ ok: true, mensaje: m });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.cerrarConversacionAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const conv = await SoporteConversacion.findByPk(id);
    if (!conv) return res.status(404).json({ msg: "Conversación no encontrada" });

    conv.estado = "cerrado";
    await conv.save();

    res.json({ ok: true, conversacion: conv });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.abrirConversacionConClienteAdmin = async (req, res) => {
  try {
    const { clienteId } = req.params;
    const cliente = await Usuario.findByPk(clienteId, { attributes: ["id", "nombre", "email", "rol"] });
    if (!cliente) return res.status(404).json({ msg: "Cliente no encontrado" });
    if (cliente.rol !== "cliente") return res.status(400).json({ msg: "El usuario no es cliente" });

    const conv = await getOrCreateConversacionAbierta(cliente.id);
    res.json({ ok: true, conversacion: conv, cliente });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

