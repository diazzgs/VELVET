const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());


const authRoutes = require("./routes/authRoutes");
const productosRoutes = require("./routes/productosRoutes");
const pedidosRoutes = require("./routes/pedidosRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/pedidos", pedidosRoutes);

app.get("/", (req, res) => res.json({ msg: "API SHOPARE funcionando" }));


const sequelize = require("./config/db");
require("./models/index");

sequelize.sync({ alter: true })
  .then(() => console.log("Base de datos sincronizada"))
  .catch(err => console.log("Error:", err));

module.exports = app;
