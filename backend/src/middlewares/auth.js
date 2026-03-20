const jwt = require("jsonwebtoken");

// =======================
// VERIFICAR TOKEN
// =======================
exports.authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ msg: "Token requerido" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "Formato de token inválido" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("Error en authMiddleware:", error.message);

    return res.status(401).json({
      msg: "Token inválido o expirado"
    });
  }
};

// =======================
// VERIFICAR ADMIN
// =======================
exports.adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: "Usuario no autenticado" });
    }

    if (req.user.rol !== "admin") {
      return res.status(403).json({ msg: "Acceso denegado" });
    }

    next();
  } catch (error) {
    console.error("Error en adminMiddleware:", error.message);

    return res.status(500).json({
      msg: "Error interno del servidor"
    });
  }
};