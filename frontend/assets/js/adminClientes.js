const AdminClientes = {};

AdminClientes.state = {
  clientes: [],
  activeId: null
};

AdminClientes._norm = function (v) {
  return String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

AdminClientes._esc = function (v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
};

AdminClientes.renderList = function () {
  const list = document.getElementById("clientesList");
  const status = document.getElementById("clientesStatus");
  const q = document.getElementById("clientesSearch")?.value || "";
  if (!list) return;

  const nq = AdminClientes._norm(q).trim();
  const items = (AdminClientes.state.clientes || []).filter(c => {
    if (!nq) return true;
    const hay = AdminClientes._norm(`${c.nombre} ${c.email} ${c.telefono || ""}`);
    return hay.includes(nq);
  });

  if (status) status.textContent = `${items.length} cliente(s)`;

  if (!items.length) {
    list.innerHTML = `<div class="p-3" style="color:#cbd5e1;">No hay clientes.</div>`;
    return;
  }

  list.innerHTML = items.map(c => {
    const active = String(c.id) === String(AdminClientes.state.activeId);
    return `
      <div class="item ${active ? "active" : ""}" onclick="AdminClientes.select(${Number(c.id)})">
        <div class="fw-bold">${AdminClientes._esc(c.nombre)}</div>
        <div class="small" style="color:#cbd5e1;">${AdminClientes._esc(c.email)} · #${c.id}</div>
      </div>
    `;
  }).join("");
};

AdminClientes.renderPedidos = function (pedidos) {
  const el = document.getElementById("clientePedidos");
  if (!el) return;

  if (!Array.isArray(pedidos) || pedidos.length === 0) {
    el.innerHTML = `<div class="muted">Este cliente no tiene pedidos.</div>`;
    return;
  }

  el.innerHTML = pedidos.map(p => {
    const detalles = p.PedidoDetalles || [];
    const items = detalles.map(d => {
      const prod = d.Producto || {};
      const img = prod.imagen ? `http://localhost:3000${prod.imagen}` : "";
      const subtotal = Number(d.precio_unitario || 0) * Number(d.cantidad || 0);
      return `
        <div style="display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.10);">
          <div style="width:64px;flex:0 0 64px;background:rgba(255,255,255,0.92);border-radius:10px;overflow:hidden;">
            ${img ? `<img src="${img}" style="width:64px;height:74px;object-fit:contain;display:block;">` : `<div style="width:64px;height:74px;display:flex;align-items:center;justify-content:center;color:#666;background:#eee;">Sin</div>`}
          </div>
          <div style="flex:1;">
            <div style="font-weight:700;">${AdminClientes._esc(prod.nombre || "Producto")}</div>
            <div style="color:#cbd5e1;font-size:12px;">${AdminClientes._esc(prod.marca || "")}</div>
            <div style="color:#e5e7eb;font-size:12px;margin-top:4px;">
              Cant: <strong>${d.cantidad}</strong> · Unit: <strong>L ${Number(d.precio_unitario || 0).toFixed(2)}</strong>
            </div>
          </div>
          <div style="font-weight:800;white-space:nowrap;">L ${subtotal.toFixed(2)}</div>
        </div>
      `;
    }).join("");

    return `
      <div style="border:1px solid rgba(255,255,255,0.12);padding:12px;border-radius:14px;margin-bottom:12px;background:rgba(0,0,0,0.20);">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div class="fw-bold">Pedido #${p.id}</div>
          <div class="small" style="color:#cbd5e1;">${new Date(p.createdAt).toLocaleString("es-HN")} · <strong>${AdminClientes._esc(p.estado)}</strong></div>
        </div>
        <div class="small" style="color:#cbd5e1;margin-top:6px;">
          Total: <strong>L ${Number(p.total || 0).toFixed(2)}</strong> · Pago: <strong>${AdminClientes._esc(p.metodo_pago || "")}</strong> · Envío: <strong>${p.pago_envio ? "Sí" : "No"}</strong>
        </div>
        <div style="margin-top:10px;">
          ${items}
        </div>
      </div>
    `;
  }).join("");
};

AdminClientes.select = async function (id) {
  AdminClientes.state.activeId = id;
  AdminClientes.renderList();

  const c = (AdminClientes.state.clientes || []).find(x => String(x.id) === String(id));
  const title = document.getElementById("clienteTitle");
  const info = document.getElementById("clienteInfo");
  const btnEliminar = document.getElementById("btnEliminar");
  const btnMensaje = document.getElementById("btnMensaje");

  if (title) title.textContent = c ? `${c.nombre} · #${c.id}` : `Cliente #${id}`;
  if (info && c) {
    info.innerHTML = `
      <div><strong>Email:</strong> ${AdminClientes._esc(c.email)}</div>
      <div><strong>Teléfono:</strong> ${AdminClientes._esc(c.telefono || "—")}</div>
      <div><strong>Dirección:</strong> ${AdminClientes._esc(c.direccion || "—")}</div>
    `;
  }

  if (btnEliminar) btnEliminar.style.display = "inline-block";
  if (btnMensaje) btnMensaje.style.display = "inline-block";

  document.getElementById("clientePedidos").innerHTML = `<div class="muted">Cargando pedidos...</div>`;
  const pedidos = await API.adminGetPedidosCliente(id);
  AdminClientes.renderPedidos(pedidos);
};

AdminClientes.init = async function () {
  const search = document.getElementById("clientesSearch");
  const btnEliminar = document.getElementById("btnEliminar");
  const btnMensaje = document.getElementById("btnMensaje");

  document.getElementById("clientesList").innerHTML = `<div class="p-3" style="color:#cbd5e1;">Cargando...</div>`;
  AdminClientes.state.clientes = await API.adminGetClientes();
  AdminClientes.renderList();

  if (search) search.addEventListener("input", AdminClientes.renderList);

  if (btnEliminar) {
    btnEliminar.addEventListener("click", async () => {
      const id = AdminClientes.state.activeId;
      if (!id) return;

      showAlert("¿Eliminar este cliente? Esta acción no se puede deshacer.", "info", async () => {
        try {
          await API.adminDeleteCliente(id);
          showSnack("Cliente eliminado", "success");
          AdminClientes.state.activeId = null;
          AdminClientes.state.clientes = await API.adminGetClientes();
          AdminClientes.renderList();
          document.getElementById("clienteTitle").textContent = "Selecciona un cliente";
          document.getElementById("clienteInfo").textContent = "";
          document.getElementById("clientePedidos").innerHTML = `<div class="muted">Selecciona un cliente para ver sus pedidos.</div>`;
          btnEliminar.style.display = "none";
          btnMensaje.style.display = "none";
        } catch (e) {
          showAlert("No se pudo eliminar el cliente.", "error");
        }
      });
    });
  }

  if (btnMensaje) {
    btnMensaje.addEventListener("click", async () => {
      const id = AdminClientes.state.activeId;
      if (!id) return;
      try {
        // crea/abre conversación y manda al panel de soporte (para mantener un solo "chat")
        await API.soporteAbrirConversacionConCliente(id);
        window.location.href = `soporte.html`;
      } catch (e) {
        showSnack("No se pudo abrir conversación", "error");
      }
    });
  }
};

window.AdminClientes = AdminClientes;

