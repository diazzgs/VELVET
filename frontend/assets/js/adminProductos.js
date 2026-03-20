const AdminProductos = {};


// ================= CATEGORÍAS =================
AdminProductos.loadCategoriasSelect = async function () {
  const select = document.getElementById("categoriaSelect");
  if (!select) return;

  select.innerHTML = `<option value="">Cargando categorías...</option>`;

  try {
    const categorias = await API.getCategorias();

    select.innerHTML = `<option value="">Seleccione una categoría</option>`;
    categorias.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.nombre;
      select.appendChild(opt);
    });

  } catch (error) {
    console.error(error);
    select.innerHTML = `<option value="">Error al cargar categorías</option>`;
  }
};


// ================= CARGAR PRODUCTO =================
AdminProductos.loadProductoToForm = async function (id) {
  try {
    const productos = await API.getProductos();
    const p = productos.find(prod => prod.id == id);

    if (!p) {
      showAlert("Producto no encontrado", "error");
      return;
    }

    document.getElementById("productoId").value = p.id;
    document.getElementById("nombre").value = p.nombre || "";
    document.getElementById("descripcion").value = p.descripcion || "";
    document.getElementById("marca").value = p.marca || "";
    document.getElementById("precio").value = p.precio || "";
    document.getElementById("stock").value = p.stock || "";
    document.getElementById("categoriaSelect").value = p.categoria_id || "";

  } catch (e) {
    console.error(e);
    showAlert("Error al cargar datos del producto.", "error");
  }
};


// ================= GUARDAR / ACTUALIZAR =================
AdminProductos.handleForm = async function (ev) {
  ev.preventDefault();

  const id = document.getElementById("productoId").value;
  const formData = new FormData();

  formData.append("nombre", nombre.value.trim());
  formData.append("descripcion", descripcion.value.trim());
  formData.append("marca", marca.value.trim());
  formData.append("precio", precio.value.trim());
  formData.append("stock", stock.value.trim());
  formData.append("categoria_id", categoriaSelect.value);

  if (imagen.files.length > 0) {
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

  } catch (error) {
    console.error(error);
    showAlert("Error al guardar producto.", "error");
  }
};


// ================= INIT =================
AdminProductos.init = async function () {

  if (document.getElementById("productos-tbody")) {
    AdminProductos.loadProductos();
  }

  if (document.getElementById("productoForm")) {

    await AdminProductos.loadCategoriasSelect();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (id) {
      document.getElementById("tituloForm").textContent = "Editar producto";
      await AdminProductos.loadProductoToForm(id);
    }

    document
      .getElementById("productoForm")
      .addEventListener("submit", AdminProductos.handleForm);
  }
};


document.addEventListener("DOMContentLoaded", AdminProductos.init);
window.AdminProductos = AdminProductos;