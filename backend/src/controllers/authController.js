const { Usuario } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registrar = async (req, res) => {
  try {
    const { nombre, email, password, rol, telefono, direccion } = req.body;

    
    const existeEmail = await Usuario.findOne({ where: { email } });
    if (existeEmail)
      return res.status(400).json({ msg: "Este correo ya está registrado." });

    
    if (telefono) {
      const existeTel = await Usuario.findOne({ where: { telefono } });
      if (existeTel)
        return res.status(400).json({ msg: "Este número de teléfono ya está en uso." });
    }

    const hash = bcrypt.hashSync(password, 10);

    const usuario = await Usuario.create({
      nombre,
      email,
      password: hash,
      rol: rol || "cliente",
      telefono,
      direccion
    });

    res.status(201).json({
      ok: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        telefono: usuario.telefono,
        direccion: usuario.direccion
      }
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};




exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(400).json({ msg: "Usuario no encontrado" });

    const ok = bcrypt.compareSync(password, usuario.password);
    if (!ok) return res.status(400).json({ msg: "Password incorrecto" });

    const token = jwt.sign(
      {
        id: usuario.id,
        rol: usuario.rol,
        email: usuario.email,
        nombre: usuario.nombre
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      telefono: usuario.telefono,
      direccion: usuario.direccion
    };

    res.json({ ok: true, token, usuario: safeUser });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
