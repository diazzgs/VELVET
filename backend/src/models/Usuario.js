const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Usuario = sequelize.define("Usuario", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  nombre: { type: DataTypes.STRING, allowNull: false },

  telefono: { type: DataTypes.STRING, allowNull: true },

  direccion: { type: DataTypes.STRING, allowNull: true },

  email: { type: DataTypes.STRING, allowNull: false, unique: true },

  password: { type: DataTypes.STRING, allowNull: false },

  rol: { type: DataTypes.ENUM("cliente", "admin"), defaultValue: "cliente" }
});

module.exports = Usuario;
