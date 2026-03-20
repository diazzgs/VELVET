const express = require("express");
const router = express.Router();

const { 
  crearProducto, 
  listarProductos, 
  actualizarProducto, 
  eliminarProducto 
} = require("../controllers/productosController");

const upload = require("../middlewares/upload");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth");

// Crear producto (CON IMAGEN)
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.single("imagen"),
  crearProducto
);

// Listar productos (PÚBLICO)
router.get("/", listarProductos);

// Editar producto (CON IMAGEN)
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("imagen"),
  actualizarProducto
);

// Eliminar producto
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  eliminarProducto
);

module.exports = router;
