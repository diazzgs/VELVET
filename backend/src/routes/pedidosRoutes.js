const express = require("express");
const router = express.Router();

const pedidosController = require("../controllers/pedidosController");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth");

// Crear pedido (cliente)
router.post("/", authMiddleware, pedidosController.crearPedido);

// Listar pedidos (admin)
router.get("/", authMiddleware, adminMiddleware, pedidosController.listarPedidos);

// Mis pedidos (cliente)
router.get("/mios", authMiddleware, pedidosController.misPedidos);

// Actualizar estado (admin) — RUTA FALTANTE ❗❗
router.put("/:id/estado", authMiddleware, adminMiddleware, pedidosController.actualizarEstado);

// Estadísticas (admin)
router.get("/estadisticas", authMiddleware, adminMiddleware, pedidosController.estadisticas);

module.exports = router;
