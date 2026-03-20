const express = require("express");
const router = express.Router();

const { Categoria } = require("../models");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth");

// =======================
// LISTAR CATEGORÍAS
// =======================
router.get("/", async (req, res) => {
  try {
    const categorias = await Categoria.findAll();
    res.json(categorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener categorías" });
  }
});

// =======================
// CREAR CATEGORÍA
// =======================
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ msg: "Nombre requerido" });
    }

    const nueva = await Categoria.create({ nombre });
    res.json(nueva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al crear categoría" });
  }
});

// =======================
// ELIMINAR CATEGORÍA 🔥
// =======================
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      return res.status(404).json({ msg: "Categoría no encontrada" });
    }

    await categoria.destroy();

    res.json({ msg: "Categoría eliminada correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al eliminar categoría" });
  }
});

module.exports = router;