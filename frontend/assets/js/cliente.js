const Cliente = {};

Cliente.getCartKey = function () {
  const user = Auth.currentUser();
  if (!user) return "shopare_cart_guest";
  return "shopare_cart_" + user.id;
};

Cliente._productos = [];
Cliente._categoriasMap = new Map();

Cliente._normalize = function (v) {
  return String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

Cliente._safeText = function (v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
};

Cliente._buildCategoriasMap = async function () {
  try {
    const cats = await API.getCategorias();
    Cliente._categoriasMap = new Map((cats || []).map(c => [String(c.id), c.nombre]));

    const select = document.getElementById("categoriaFilter");
    if (select) {
      const prev = select.value;
      select.innerHTML = `<option value="">Todas</option>`;
      cats.forEach(c => {
        const opt = document.createElement("option");
        opt.value = String(c.id);
        opt.textContent = c.nombre;
        select.appendChild(opt);
      });
      if (prev) select.value = prev;
    }
  } catch (e) {
    // Si falla, el filtro sigue existiendo (solo "Todas")
  }
};

Cliente._getFilters = function () {
  const q = document.getElementById("searchInput")?.value || "";
  const categoria = document.getElementById("categoriaFilter")?.value || "";
  const sort = document.getElementById("sortSelect")?.value || "relevance";
  return { q, categoria, sort };
};

Cliente._applyFiltersAndSort = function (productos) {
  const { q, categoria, sort } = Cliente._getFilters();
  const nq = Cliente._normalize(q).trim();

  let list = Array.isArray(productos) ? [...productos] : [];

  if (categoria) {
    list = list.filter(p => String(p.categoria_id || "") === String(categoria));
  }

  if (nq) {
    list = list.filter(p => {
      const hay = Cliente._normalize(
        `${p.nombre || ""} ${p.marca || ""} ${p.descripcion || ""}`
      );
      return hay.includes(nq);
    });
  }

  const byName = (a, b) => Cliente._normalize(a.nombre).localeCompare(Cliente._normalize(b.nombre));
  const byPrice = (a, b) => Number(a.precio || 0) - Number(b.precio || 0);

  if (sort === "name_asc") list.sort(byName);
  else if (sort === "name_desc") list.sort((a, b) => byName(b, a));
  else if (sort === "price_asc") list.sort(byPrice);
  else if (sort === "price_desc") list.sort((a, b) => byPrice(b, a));
  // relevance: mantiene el orden original del backend

  return list;
};

Cliente.renderProductosCliente = function () {
  const container = document.getElementById("productos-container");
  if (!container) return;

  const resultsLabel = document.getElementById("resultsLabel");
  const filtered = Cliente._applyFiltersAndSort(Cliente._productos);

  if (resultsLabel) {
    resultsLabel.textContent = `${filtered.length} producto(s)`;
  }

  if (!filtered.length) {
    container.innerHTML = `
      <div class="col-12">
        <div class="p-4" style="border:1px solid rgba(255,255,255,0.10);background:rgba(0,0,0,0.25);">
          <strong>No encontramos productos con esos filtros.</strong>
          <div class="small" style="color:#cbd5e1;">Prueba con otra búsqueda o cambia la categoría.</div>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  filtered.forEach(p => {
    const catName = Cliente._categoriasMap.get(String(p.categoria_id)) || "Sin categoría";
    const img = p.imagen ? `http://localhost:3000${p.imagen}` : "";

    container.innerHTML += `
      <div class="col-md-4 col-lg-3">
        <div class="card shadow-sm h-100 position-relative" style="cursor:pointer;" onclick="Cliente.goToProducto(${Number(p.id)})">
          <div class="product-img-wrapper">
            <img src="${img}" alt="${Cliente._safeText(p.nombre)}" class="card-img-top product-img"
                 style="object-fit:contain;background:rgba(255,255,255,0.92);">
          </div>

          <div class="card-body d-flex flex-column">
            <h5 class="product-title">${Cliente._safeText(p.nombre)}</h5>
            <div class="product-meta">
              <span>${Cliente._safeText(catName)}</span>
              <span>${Cliente._safeText(p.marca || "")}</span>
            </div>

            ${p.descripcion ? `<p class="text-muted small mt-2">${Cliente._safeText(p.descripcion)}</p>` : ""}

            <p class="product-price">${Utils.formatMoney(Number(p.precio))}</p>

            <button class="btn btn-outline-primary mt-auto"
                    onclick="event.stopPropagation(); Cliente.addToCart(${Number(p.id)})"
                    style="border-radius:0;">
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    `;
  });
};

Cliente.goToProducto = function (idProducto) {
  window.location.href = `producto.html?id=${encodeURIComponent(String(idProducto))}`;
};


Cliente.loadProductosCliente = async function () {
  const container = document.getElementById("productos-container");
  container.innerHTML = "<p>Cargando productos...</p>";

  try {
    await Cliente._buildCategoriasMap();
    const productos = await API.getProductos();
    Cliente._productos = productos || [];

    if (!Cliente._productos.length) {
      container.innerHTML = "<p>No hay productos disponibles.</p>";
      return;
    }

    // listeners de filtros (solo una vez)
    if (!Cliente._filtersBound) {
      Cliente._filtersBound = true;

      const onChange = () => Cliente.renderProductosCliente();
      document.getElementById("searchInput")?.addEventListener("input", onChange);
      document.getElementById("categoriaFilter")?.addEventListener("change", onChange);
      document.getElementById("sortSelect")?.addEventListener("change", onChange);

      document.getElementById("clearFiltersBtn")?.addEventListener("click", () => {
        const s = document.getElementById("searchInput");
        const c = document.getElementById("categoriaFilter");
        const o = document.getElementById("sortSelect");
        if (s) s.value = "";
        if (c) c.value = "";
        if (o) o.value = "relevance";
        Cliente.renderProductosCliente();
      });
    }

    Cliente.renderProductosCliente();

  } catch {
    container.innerHTML = "<p>Error al cargar productos.</p>";
  }
};

Cliente.loadProductoDetalle = async function () {
  const container = document.getElementById("producto-detalle");
  if (!container) return;

  const id = Utils.getParam("id");
  if (!id) {
    container.innerHTML = `<p>Producto no encontrado.</p>`;
    return;
  }

  container.innerHTML = `<p>Cargando producto...</p>`;

  try {
    await Cliente._buildCategoriasMap();
    const productos = await API.getProductos();
    const p = (productos || []).find(x => String(x.id) === String(id));

    if (!p) {
      container.innerHTML = `<p>Producto no encontrado.</p>`;
      return;
    }

    const catName = Cliente._categoriasMap.get(String(p.categoria_id)) || "Sin categoría";
    const img = p.imagen ? `http://localhost:3000${p.imagen}` : "";
    const stock = Number(p.stock || 0);

    container.innerHTML = `
      <div class="row g-4">
        <div class="col-12 col-lg-6">
          <div class="p-3" style="background:rgba(255,255,255,0.92);border:1px solid rgba(255,255,255,0.15);">
            <img src="${img}" alt="${Cliente._safeText(p.nombre)}"
                 style="width:100%;height:min(520px,70vh);object-fit:contain;display:block;">
          </div>
        </div>

        <div class="col-12 col-lg-6">
          <div class="p-3" style="background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.10);">
            <div class="small text-uppercase" style="letter-spacing:1.4px;color:#cbd5e1;">
              ${Cliente._safeText(catName)} · ${Cliente._safeText(p.marca || "")}
            </div>
            <h2 class="mt-2" style="font-weight:650;">${Cliente._safeText(p.nombre)}</h2>

            <div class="mt-3" style="font-size:22px;font-weight:700;">
              ${Utils.formatMoney(Number(p.precio))}
            </div>

            <div class="mt-2 small" style="color:${stock > 0 ? "#86efac" : "#fca5a5"};">
              ${stock > 0 ? `En stock (${stock})` : "Agotado"}
            </div>

            ${p.descripcion ? `
              <hr style="border-color:rgba(255,255,255,0.12);">
              <div class="fw-bold mb-2">Descripción</div>
              <div style="color:#e5e7eb;white-space:pre-wrap;">${Cliente._safeText(p.descripcion)}</div>
            ` : ""}

            <hr style="border-color:rgba(255,255,255,0.12);">
            <div class="fw-bold mb-2">Atributos</div>
            <div class="row g-2 small" style="color:#e5e7eb;">
              <div class="col-6"><strong>ID:</strong> ${Cliente._safeText(p.id)}</div>
              <div class="col-6"><strong>Marca:</strong> ${Cliente._safeText(p.marca || "")}</div>
              <div class="col-6"><strong>Categoría:</strong> ${Cliente._safeText(catName)}</div>
              <div class="col-6"><strong>Stock:</strong> ${Cliente._safeText(stock)}</div>
            </div>

            <div class="d-grid gap-2 mt-4">
              <button class="btn btn-primary"
                      ${stock <= 0 ? "disabled" : ""}
                      onclick="Cliente.addToCart(${Number(p.id)})"
                      style="border-radius:0;">
                Agregar al carrito
              </button>
              <button class="btn btn-outline-light" onclick="history.back()" style="border-radius:0;">
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (e) {
    container.innerHTML = `<p>Error al cargar el producto.</p>`;
  }
};


Cliente.addToCart = function (idProducto) {
  const key = Cliente.getCartKey();
  let carrito = JSON.parse(localStorage.getItem(key) || "[]");

  const existente = carrito.find(item => item.producto_id === idProducto);

  if (existente) existente.cantidad++;
  else carrito.push({ producto_id: idProducto, cantidad: 1 });

  localStorage.setItem(key, JSON.stringify(carrito));

  
  showSnack("Producto agregado al carrito", "success");
};


Cliente.loadCarrito = async function () {
  const container = document.getElementById("carrito-container");
  const key = Cliente.getCartKey();
  let carrito = JSON.parse(localStorage.getItem(key) || "[]");

  if (!carrito.length) {
    container.innerHTML = "<p>Tu carrito está vacío.</p>";
    document.getElementById("carrito-total").innerText = "L 0.00";
    return;
  }

  const productos = await API.getProductos();
  let total = 0;
  let html = "";

  carrito.forEach(item => {
    const prod = productos.find(p => p.id === item.producto_id);
    if (!prod) return;

    const precio = Number(prod.precio);
    const subtotal = precio * item.cantidad;
    total += subtotal;

    html += `
      <div class="carrito-item">
        <div class="row g-3">
          <div class="col-auto">
            <img src="http://localhost:3000${prod.imagen}" alt="${Cliente._safeText(prod.nombre)}">
          </div>

          <div class="col">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
              <div>
                <div style="font-size:18px;font-weight:800;letter-spacing:-0.2px;">${Cliente._safeText(prod.nombre)}</div>
                <div class="text-muted small">${Cliente._safeText(prod.marca || "")}</div>
              </div>

              <div style="text-align:right;">
                <div style="font-weight:800;">L ${precio.toFixed(2)}</div>
                <div class="text-muted small">Subtotal: L ${subtotal.toFixed(2)}</div>
              </div>
            </div>

            ${prod.descripcion ? `<div class="text-muted small mt-2" style="max-width:760px;">${Cliente._safeText(prod.descripcion)}</div>` : ""}

            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
              <div class="d-flex align-items-center gap-2">
                <button class="btn btn-sm btn-outline-dark" onclick="Cliente.cambiarCantidad(${prod.id}, -1)" style="border-radius:0;">−</button>
                <div style="min-width:42px;text-align:center;font-weight:800;">${item.cantidad}</div>
                <button class="btn btn-sm btn-outline-dark" onclick="Cliente.cambiarCantidad(${prod.id}, 1)" style="border-radius:0;">+</button>
              </div>

              <button class="btn btn-sm btn-outline-danger" onclick="Cliente.eliminarDelCarrito(${prod.id})" style="border-radius:0;">
                Quitar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  document.getElementById("carrito-total").innerText = "L " + total.toFixed(2);
};


Cliente.cambiarCantidad = function (idProducto, delta) {
  const key = Cliente.getCartKey();
  let carrito = JSON.parse(localStorage.getItem(key) || "[]");

  const item = carrito.find(i => i.producto_id === idProducto);
  if (!item) return;

  item.cantidad += delta;

  if (item.cantidad <= 0)
    carrito = carrito.filter(x => x.producto_id !== idProducto);

  localStorage.setItem(key, JSON.stringify(carrito));
  Cliente.loadCarrito();
};


Cliente.eliminarDelCarrito = function (idProducto) {
  const key = Cliente.getCartKey();
  let carrito = JSON.parse(localStorage.getItem(key) || "[]");

  carrito = carrito.filter(x => x.producto_id !== idProducto);

  localStorage.setItem(key, JSON.stringify(carrito));
  Cliente.loadCarrito();
};


Cliente.realizarPedido = async function () {
  const key = Cliente.getCartKey();
  let carrito = JSON.parse(localStorage.getItem(key) || "[]");

  if (!carrito.length) {
    showAlert("El carrito está vacío.", "error");
    return;
  }

  const metodo_pago = document.getElementById("metodoPago").value;
  const pago_envio = document.getElementById("pagoEnvio").checked;

  try {
    await API.crearPedido({
      items: carrito,
      metodo_pago,
      pago_envio
    });

    showAlert("Pedido realizado con éxito.", "success", () => {
      localStorage.removeItem(key);
      window.location.href = "pedidos.html";
    });

  } catch (err) {
    showAlert(err?.message || "Error al procesar pedido.", "error");
  }
};



window.Cliente = Cliente;
