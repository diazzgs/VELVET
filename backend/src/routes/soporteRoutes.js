const express = require("express");
const router = express.Router();

const soporteController = require("../controllers/soporteController");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth");

// Cliente: enviar mensaje (crea conversación si no existe)
router.post("/mensajes", authMiddleware, soporteController.enviarMensajeCliente);

// Cliente: ver mensajes de su conversación abierta
router.get("/mis-mensajes", authMiddleware, soporteController.misMensajes);

// Admin: listar conversaciones
router.get("/conversaciones", authMiddleware, adminMiddleware, soporteController.listarConversacionesAdmin);

// Admin: abrir/crear conversación con cliente (mensaje directo)
router.post("/conversaciones/cliente/:clienteId/abrir", authMiddleware, adminMiddleware, soporteController.abrirConversacionConClienteAdmin);

// Admin: ver mensajes de una conversación
router.get("/conversaciones/:id", authMiddleware, adminMiddleware, soporteController.mensajesConversacionAdmin);

// Admin: responder a conversación
router.post("/conversaciones/:id/responder", authMiddleware, adminMiddleware, soporteController.responderAdmin);

// Admin: cerrar conversación
router.post("/conversaciones/:id/cerrar", authMiddleware, adminMiddleware, soporteController.cerrarConversacionAdmin);

module.exports = router;

