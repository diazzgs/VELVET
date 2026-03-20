const { Producto } = require("../models");

exports.crearProducto = async (req, res) => {
  try {
    const data = req.body;

    if (req.file) {
      data.imagen = `/uploads/productos/${req.file.filename}`;
    }

    const nuevo = await Producto.create(data);
    res.json(nuevo);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};


exports.listarProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll();
    res.json(productos);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};


exports.actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id);

    if (!producto) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    const data = req.body;

    if (req.file) {
      data.imagen = `/uploads/productos/${req.file.filename}`;
    }

    await producto.update(data);

    res.json({ ok: true, msg: "Producto actualizado", producto });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};



exports.eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    await producto.destroy();

    res.json({ ok: true, msg: "Producto eliminado" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
