const Admin = {};

Admin._dashModal = {
  ventas: { title: "Últimas ventas (completadas)", html: "" },
  productos: { title: "Productos más vendidos", html: "" },
  clientes: { title: "Mejores clientes", html: "" },
  activos: { title: "Clientes activos (30 días)", html: "" }
};

Admin.openDashModal = function (key) {
  const cfg = Admin._dashModal[key];
  if (!cfg) return;

  const title = document.getElementById("dashModalTitle");
  const body = document.getElementById("dashModalBody");
  const modalEl = document.getElementById("dashModal");
  if (!modalEl || !body || !title) return;

  title.textContent = cfg.title;
  body.innerHTML = cfg.html || `<div class="text-muted">No hay datos para mostrar.</div>`;

  if (window.bootstrap && bootstrap.Modal) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
};


Admin.loadProductos = async function () {
  const tabla = document.getElementById("tablaProductos");
  tabla.innerHTML = "<tr><td colspan='6'>Cargando...</td></tr>";

  try {
    const productos = await API.getProductos();
    tabla.innerHTML = "";

    productos.forEach(p => {
      tabla.innerHTML += `
        <tr>
          <td>${p.id}</td>
          <td><img src="http://localhost:3000${p.imagen}" width="60"></td>
          <td>${p.nombre}</td>
          <td>L ${Number(p.precio).toFixed(2)}</td>
          <td>${p.stock}</td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="Admin.editar(${p.id})">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="Admin.eliminar(${p.id})">Eliminar</button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    tabla.innerHTML = "<tr><td colspan='6'>Error al cargar productos</td></tr>";
  }
};


Admin.editar = function (id) {
  window.location.href = `producto-form.html?id=${id}`;
};


Admin.eliminar = async function (id) {
  showAlert("¿Eliminar producto?", "info", async () => {
    try {
      await API.deleteProducto(id);
      showSnack("Producto eliminado", "success");
      Admin.loadProductos();
    } catch (err) {
      showAlert("Error al eliminar producto.", "error");
    }
  });
};


Admin.initProductoForm = async function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  
  const selectCat = document.getElementById("categoria_id");

  try {
    const categorias = await API.getCategorias();
    selectCat.innerHTML = `<option value="">Seleccione categoría</option>`;
    categorias.forEach(c => {
      selectCat.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
    });
  } catch (e) {
    selectCat.innerHTML = `<option value="">Error cargando categorías</option>`;
  }

  if (id) {
    try {
      document.getElementById("tituloForm").textContent = "Editar producto";
      document.getElementById("productoId").value = id;

      const productos = await API.getProductos();
      const prod = productos.find(x => x.id == id);

      if (!prod) return alert("Producto no encontrado");

      document.getElementById("nombre").value = prod.nombre;
      document.getElementById("descripcion").value = prod.descripcion;
      document.getElementById("marca").value = prod.marca;
      document.getElementById("precio").value = prod.precio;
      document.getElementById("stock").value = prod.stock;
      selectCat.value = prod.categoria_id;

    } catch (e) {
      alert("Error al cargar datos del producto.");
    }
  }

  
  document.getElementById("formProducto").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nombre", nombre.value);
    formData.append("descripcion", descripcion.value);
    formData.append("marca", marca.value);
    formData.append("precio", precio.value);
    formData.append("stock", stock.value);
    formData.append("categoria_id", selectCat.value);

    if (imagen.files[0]) {
      formData.append("imagen", imagen.files[0]);
    }

    try {
      if (id) {
        await API.updateProducto(id, formData);
      showAlert("Producto actualizado correctamente.", "success", () => {
        window.location.href = "productos.html";
      });
      } else {
        await API.createProducto(formData);
      showAlert("Producto creado correctamente.", "success", () => {
        window.location.href = "productos.html";
      });
      }

    } catch (err) {
      showAlert("Error al guardar producto.", "error");
    }
  });
};


Admin.loadPedidosAdmin = async function () {
  const container = document.getElementById("admin-pedidos-container");
  container.innerHTML = "<p>Cargando pedidos...</p>";

  try {
    const pedidos = await API.getPedidosAdmin();

    if (pedidos.length === 0) {
      container.innerHTML = "<p>No hay pedidos registrados.</p>";
      return;
    }

    let html = "";

    pedidos.forEach(p => {
      const detalles = p.PedidoDetalles || [];

      const colorEstado =
        p.estado === "completado"
          ? "green"
          : p.estado === "procesado"
          ? "orange"
          : "black";

      const itemsHtml = detalles.map(d => {
        const prod = d.Producto || {};
        const img = prod.imagen ? `http://localhost:3000${prod.imagen}` : "";
        const subtotal = Number(d.precio_unitario || 0) * Number(d.cantidad || 0);

        return `
          <div style="display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.10);">
            <div style="width:70px;flex:0 0 70px;background:rgba(255,255,255,0.92);border-radius:10px;overflow:hidden;">
              ${img ? `<img src="${img}" style="width:70px;height:80px;object-fit:contain;display:block;">` : `<div style="width:70px;height:80px;display:flex;align-items:center;justify-content:center;color:#666;background:#eee;">Sin</div>`}
            </div>
            <div style="flex:1;">
              <div style="font-weight:700;">${prod.nombre || "Producto eliminado"}</div>
              <div style="color:#cbd5e1;font-size:12px;">${prod.marca || ""}</div>
              <div style="color:#e5e7eb;font-size:12px;margin-top:4px;">
                Cantidad: <strong>${d.cantidad}</strong> · Unit: <strong>L ${Number(d.precio_unitario || 0).toFixed(2)}</strong>
              </div>
            </div>
            <div style="font-weight:800;white-space:nowrap;">L ${subtotal.toFixed(2)}</div>
          </div>
        `;
      }).join("");

      html += `
        <div class="card p-3 mb-3 shadow-sm">
          <h5>Pedido #${p.id}</h5>
<p><strong>Cliente:</strong> ${p.Usuario?.nombre || "Usuario eliminado"} — ${p.Usuario?.email || ""} (ID: ${p.usuario_id})</p>
          <p><strong>Total:</strong> L ${p.total}</p>
          <p><strong>Fecha:</strong> ${new Date(p.createdAt).toLocaleString("es-HN")}</p>
          <p><strong>Método de pago:</strong> ${p.metodo_pago || "No especificado"}</p>

          <p>
            <strong>Paga envío:</strong>
            <span style="color:${p.pago_envio ? '#28a745' : '#d9534f'};font-weight:bold">
              ${p.pago_envio ? "Sí" : "No"}
            </span>
          </p>

          <p><strong>Estado actual:</strong>
            <span style="color:${colorEstado}; font-weight:bold">${p.estado}</span>
          </p>

          <label class="fw-bold">Cambiar estado:</label>

          <select class="form-select mb-3"
                  onchange="Admin.cambiarEstado(${p.id}, this.value)"
                  ${p.estado === "completado" ? "disabled" : ""}>
            <option value="">Seleccionar...</option>
            <option value="pendiente" ${p.estado === "pendiente" ? "selected" : ""}>Pendiente</option>
            <option value="procesado" ${p.estado === "procesado" ? "selected" : ""}>Procesado</option>
            <option value="completado" ${p.estado === "completado" ? "selected" : ""}>Completado</option>
          </select>

          ${
            p.estado === "completado"
              ? "<p class='text-danger fw-bold'>⚠ Este pedido ya está completado y no puede modificarse.</p>"
              : ""
          }

          <div style="margin-top:10px;">
            <strong>Productos:</strong>
            <div style="margin-top:8px;">
              ${itemsHtml || "<div style='color:#cbd5e1;'>Sin productos.</div>"}
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

  } catch (e) {
    console.error("ERROR ADMIN:", e);
    container.innerHTML = "<p>Error al cargar pedidos.</p>";
  }
};


Admin.cambiarEstado = async function (id, estado) {
  if (!estado) return;

  try {
    await API.updateEstadoPedido(id, estado);
    showSnack("Estado actualizado con éxito.", "success");
    Admin.loadPedidosAdmin();
  } catch (e) {
    showAlert(e.error || e.message || "Error al actualizar estado.", "error");
  }
};

Admin.loadEstadisticas = async function () {
  try {
    const stats = await API.getEstadisticas();

    document.getElementById("totalGeneral").textContent = "L " + Number(stats.totalGeneral).toFixed(2);
    document.getElementById("totalHoy").textContent = "L " + Number(stats.totalHoy).toFixed(2);
    document.getElementById("totalMes").textContent = "L " + Number(stats.totalMes).toFixed(2);
    document.getElementById("totalAno").textContent = "L " + Number(stats.totalAno).toFixed(2);

    document.getElementById("pedidosCompletados").textContent = stats.pedidosCompletados;
    document.getElementById("productosVendidos").textContent = stats.productosVendidos;

  } catch (e) {
    console.error("Error cargando estadísticas:", e);
  }
};

Admin.loadDashboardResumen = async function () {
  const elVentas = document.getElementById("dash-ultimas-ventas");
  const elTopProd = document.getElementById("dash-top-productos");
  const elTopCli = document.getElementById("dash-top-clientes");
  const elActivos = document.getElementById("dash-clientes-activos");

  try {
    const data = await API.adminDashboardResumen();

    if (elVentas) {
      const ventas = data.ultimasVentas || [];
      const fullHtml = ventas.length
        ? ventas.map(v => `
            <div class="dash-item">
              <div class="d-flex justify-content-between flex-wrap gap-2">
                <div><strong>Pedido #${v.id}</strong> · ${v.Usuario?.nombre || "Cliente"} <span class="dash-muted">(${v.Usuario?.email || ""})</span></div>
                <div><strong>L ${Number(v.total || 0).toFixed(2)}</strong></div>
              </div>
              <div class="dash-muted small">${new Date(v.createdAt).toLocaleString("es-HN")} · ${v.PedidoDetalles?.length || 0} item(s)</div>
            </div>
          `).join("")
        : `<div class="dash-muted">No hay ventas completadas.</div>`;

      Admin._dashModal.ventas.html = `
        <div style="max-width:980px;margin:auto;">
          ${fullHtml}
        </div>
      `;

      // vista compacta (top 4)
      const compact = ventas.slice(0, 4);
      elVentas.innerHTML = compact.length
        ? compact.map(v => `
            <div class="dash-item">
              <div class="d-flex justify-content-between flex-wrap gap-2">
                <div><strong>#${v.id}</strong> · ${v.Usuario?.nombre || "Cliente"}</div>
                <div><strong>L ${Number(v.total || 0).toFixed(2)}</strong></div>
              </div>
              <div class="dash-muted small">${new Date(v.createdAt).toLocaleString("es-HN")}</div>
            </div>
          `).join("")
        : `<div class="dash-muted">No hay ventas completadas.</div>`;
    }

    if (elTopProd) {
      const top = data.topProductos || [];
      const fullHtml = top.length
        ? top.map(t => {
            const p = t.Producto || {};
            const img = p.imagen ? `http://localhost:3000${p.imagen}` : "";
            return `
              <div class="dash-item">
                <div class="d-flex gap-3 align-items-center">
                  <div style="width:54px;height:54px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;display:flex;align-items:center;justify-content:center;">
                  ${img ? `<img src="${img}" style="width:54px;height:54px;object-fit:contain;">` : `<span class="text-muted small">Sin</span>`}
                  </div>
                  <div style="flex:1;">
                    <div><strong>${p.nombre || "Producto"}</strong></div>
                    <div class="dash-muted small">${p.marca || ""}</div>
                  </div>
                  <div style="text-align:right;">
                    <div><strong>${Number(t.vendidos || 0)}</strong> vendidos</div>
                    <div class="dash-muted small">L ${Number(t.ingreso || 0).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            `;
          }).join("")
        : `<div class="text-muted">Sin datos.</div>`;

      Admin._dashModal.productos.html = `<div style="max-width:980px;margin:auto;">${fullHtml}</div>`;

      const compact = top.slice(0, 4);
      elTopProd.innerHTML = compact.length
        ? compact.map(t => {
            const p = t.Producto || {};
            const img = p.imagen ? `http://localhost:3000${p.imagen}` : "";
            return `
              <div class="dash-item">
                <div class="d-flex gap-3 align-items-center">
                  <div style="width:44px;height:44px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;display:flex;align-items:center;justify-content:center;">
                    ${img ? `<img src="${img}" style="width:44px;height:44px;object-fit:contain;">` : `<span class="text-muted small">Sin</span>`}
                  </div>
                  <div style="flex:1;">
                    <div><strong>${p.nombre || "Producto"}</strong></div>
                    <div class="dash-muted small">${Number(t.vendidos || 0)} vendidos</div>
                  </div>
                  <div style="text-align:right;"><strong>L ${Number(t.ingreso || 0).toFixed(2)}</strong></div>
                </div>
              </div>
            `;
          }).join("")
        : `<div class="dash-muted">Sin datos.</div>`;
    }

    if (elTopCli) {
      const topC = data.topClientes || [];
      const fullHtml = topC.length
        ? topC.map(t => `
            <div class="dash-item">
              <div class="d-flex justify-content-between flex-wrap gap-2">
                <div><strong>${t.Usuario?.nombre || "Cliente"}</strong> · ${t.Usuario?.email || ""}</div>
                <div><strong>L ${Number(t.gastado || 0).toFixed(2)}</strong></div>
              </div>
              <div class="text-muted small">${Number(t.pedidos || 0)} pedido(s) completados</div>
            </div>
          `).join("")
        : `<div class="text-muted">Sin datos.</div>`;

      Admin._dashModal.clientes.html = `<div style="max-width:980px;margin:auto;">${fullHtml}</div>`;

      const compact = topC.slice(0, 4);
      elTopCli.innerHTML = compact.length
        ? compact.map(t => `
            <div class="dash-item">
              <div class="d-flex justify-content-between flex-wrap gap-2">
                <div><strong>${t.Usuario?.nombre || "Cliente"}</strong></div>
                <div><strong>L ${Number(t.gastado || 0).toFixed(2)}</strong></div>
              </div>
              <div class="dash-muted small">${t.Usuario?.email || ""} · ${Number(t.pedidos || 0)} pedido(s)</div>
            </div>
          `).join("")
        : `<div class="dash-muted">Sin datos.</div>`;
    }

    if (elActivos) {
      const act = data.clientesActivos || [];
      const fullHtml = act.length
        ? act.map(a => `
            <div class="dash-item">
              <div><strong>${a.Usuario?.nombre || "Cliente"}</strong> · ${a.Usuario?.email || ""}</div>
              <div class="text-muted small">Última compra: ${a.ultima_compra ? new Date(a.ultima_compra).toLocaleString("es-HN") : "—"}</div>
            </div>
          `).join("")
        : `<div class="text-muted">Sin clientes activos en 30 días.</div>`;

      Admin._dashModal.activos.html = `<div style="max-width:980px;margin:auto;">${fullHtml}</div>`;

      const compact = act.slice(0, 4);
      elActivos.innerHTML = compact.length
        ? compact.map(a => `
            <div class="dash-item">
              <div class="d-flex justify-content-between flex-wrap gap-2">
                <div><strong>${a.Usuario?.nombre || "Cliente"}</strong></div>
                <div class="dash-muted small">${a.ultima_compra ? new Date(a.ultima_compra).toLocaleString("es-HN") : "—"}</div>
              </div>
              <div class="dash-muted small">${a.Usuario?.email || ""}</div>
            </div>
          `).join("")
        : `<div class="dash-muted">Sin clientes activos en 30 días.</div>`;
    }
  } catch (e) {
    console.error("Error dashboardResumen:", e);
    const msg = e?.message || "Error al cargar.";
    if (elVentas) elVentas.textContent = msg;
    if (elTopProd) elTopProd.textContent = msg;
    if (elTopCli) elTopCli.textContent = msg;
    if (elActivos) elActivos.textContent = msg;
    if (typeof showAlert === "function") showAlert(msg, "error");
  }
};


window.Admin = Admin;
