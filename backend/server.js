require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./src/config/db");



// rutas
const authRoutes = require("./src/routes/authRoutes");
const productosRoutes = require("./src/routes/productosRoutes");
const pedidosRoutes = require("./src/routes/pedidosRoutes");
const categoriasRoutes = require("./src/routes/categoriasRoutes");
const soporteRoutes = require("./src/routes/soporteRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

const app = express();
app.use(express.json());
app.use(cors());

// registrar rutas
app.use("/api/auth", authRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/categorias", categoriasRoutes);
app.use("/api/soporte", soporteRoutes);
app.use("/api/admin", adminRoutes);


// sincronizar bd
sequelize.sync().then(() => {
  console.log("Base de datos sincronizada");
  app.listen(process.env.PORT, () => {
    console.log("Servidor en puerto " + process.env.PORT);
  });
});
