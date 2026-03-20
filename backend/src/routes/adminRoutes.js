const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth");

// Clientes
router.get("/clientes", authMiddleware, adminMiddleware, adminController.listarClientes);
router.delete("/clientes/:id", authMiddleware, adminMiddleware, adminController.eliminarCliente);
router.get("/clientes/:id/pedidos", authMiddleware, adminMiddleware, adminController.pedidosDeCliente);

// Dashboard extra
router.get("/dashboard/resumen", authMiddleware, adminMiddleware, adminController.dashboardResumen);

module.exports = router;

