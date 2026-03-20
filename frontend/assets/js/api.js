const API_URL = "http://localhost:3000";

// =======================
// TOKEN / USER
// =======================
function getToken() {
  return localStorage.getItem("shopare_token") || "";
}

function getUser() {
  const raw = localStorage.getItem("shopare_user");
  try {
    return JSON.parse(raw) || null;
  } catch {
    return null;
  }
}

// =======================
// FETCH BASE
// =======================
async function apiFetch(endpoint, options = {}) {
  const headers = options.headers || {};

  const token = getToken();
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  // ⚠️ IMPORTANTE: evitar conflictos con FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  options.headers = headers;

  try {
    const res = await fetch(API_URL + endpoint, options);

    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      const msg = data.msg || data.error || "Error en la petición";
      throw new Error(`[${res.status}] ${msg} (${endpoint})`);
    }

    return data;
  } catch (err) {
    console.error("API ERROR:", err.message);
    throw err;
  }
}

// =======================
// AUTH
// =======================
async function login(email, password) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

async function registerUser(data) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// =======================
// PRODUCTOS
// =======================
async function getProductos() {
  return apiFetch("/api/productos");
}

async function createProducto(formData) {
  return apiFetch("/api/productos", {
    method: "POST",
    body: formData,
  });
}

async function updateProducto(id, formData) {
  return apiFetch(`/api/productos/${id}`, {
    method: "PUT",
    body: formData,
  });
}

async function deleteProducto(id) {
  return apiFetch(`/api/productos/${id}`, {
    method: "DELETE",
  });
}

// =======================
// CATEGORÍAS
// =======================
async function getCategorias() {
  return apiFetch("/api/categorias");
}

async function createCategoria(data) {
  return apiFetch("/api/categorias", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

async function deleteCategoria(id) {
  return apiFetch(`/api/categorias/${id}`, {
    method: "DELETE"
  });
}

// =======================
// PEDIDOS
// =======================
async function createPedido(data) {
  return apiFetch("/api/pedidos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function getMisPedidos() {
  return apiFetch("/api/pedidos/mios");
}

async function getPedidosAdmin() {
  return apiFetch("/api/pedidos");
}

async function updateEstadoPedido(id, estado) {
  return apiFetch(`/api/pedidos/${id}/estado`, {
    method: "PUT",
    body: JSON.stringify({ estado }),
  });
}

async function getEstadisticas() {
  return apiFetch("/api/pedidos/estadisticas");
}

// =======================
// SOPORTE (CHAT)
// =======================
async function soporteEnviarMensaje(mensaje) {
  return apiFetch("/api/soporte/mensajes", {
    method: "POST",
    body: JSON.stringify({ mensaje })
  });
}

async function soporteMisMensajes() {
  return apiFetch("/api/soporte/mis-mensajes");
}

async function soporteConversacionesAdmin() {
  return apiFetch("/api/soporte/conversaciones");
}

async function soporteConversacionAdmin(id) {
  return apiFetch(`/api/soporte/conversaciones/${id}`);
}

async function soporteAbrirConversacionConCliente(clienteId) {
  return apiFetch(`/api/soporte/conversaciones/cliente/${clienteId}/abrir`, {
    method: "POST"
  });
}

async function soporteResponderAdmin(id, mensaje) {
  return apiFetch(`/api/soporte/conversaciones/${id}/responder`, {
    method: "POST",
    body: JSON.stringify({ mensaje })
  });
}

async function soporteCerrarAdmin(id) {
  return apiFetch(`/api/soporte/conversaciones/${id}/cerrar`, {
    method: "POST"
  });
}

// =======================
// ADMIN (GESTIÓN)
// =======================
async function adminGetClientes() {
  return apiFetch("/api/admin/clientes");
}

async function adminDeleteCliente(id) {
  return apiFetch(`/api/admin/clientes/${id}`, { method: "DELETE" });
}

async function adminGetPedidosCliente(id) {
  return apiFetch(`/api/admin/clientes/${id}/pedidos`);
}

async function adminDashboardResumen() {
  return apiFetch("/api/admin/dashboard/resumen");
}

// =======================
// EXPORT GLOBAL
// =======================
window.API = {
  login,
  registerUser,

  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,

  getCategorias,
  createCategoria,
  deleteCategoria,

  createPedido,
  crearPedido: createPedido,
  getMisPedidos,
  getPedidosAdmin,
  updateEstadoPedido,

  getEstadisticas,

  soporteEnviarMensaje,
  soporteMisMensajes,
  soporteConversacionesAdmin,
  soporteConversacionAdmin,
  soporteAbrirConversacionConCliente,
  soporteResponderAdmin,
  soporteCerrarAdmin,

  adminGetClientes,
  adminDeleteCliente,
  adminGetPedidosCliente,
  adminDashboardResumen,

  getToken,
  getUser
};