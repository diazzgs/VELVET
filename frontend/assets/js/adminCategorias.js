const AdminCategorias = {};

AdminCategorias.cargarCategorias = async function () {
  const cont = document.getElementById("lista-categorias");
  cont.innerHTML = "<p>Cargando...</p>";

  try {
    const categorias = await API.getCategorias();

    if (!categorias || categorias.length === 0) {
      cont.innerHTML = "<p>No hay categorías registradas.</p>";
      return;
    }

    let html = `<table class="table table-bordered table-striped"><tbody>`;

    categorias.forEach((cat, index) => {
      const imagenes = [
        "../assets/img/hero1.jpg",
        "../assets/img/bg2.jpg",
        "../assets/img/fondo-vogue.jpg"
      ];

      const imagen = imagenes[index % imagenes.length];

      html += `
        <tr>
          <td style="height:220px;background:url('${imagen}') center/cover no-repeat;"></td>
          <td>
            <div class="categoria-content">
              <div class="categoria-nombre">${cat.nombre}</div>
              <button class="btn-eliminar" onclick="AdminCategorias.eliminar(${cat.id})">
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    html += "</tbody></table>";
    cont.innerHTML = html;

  } catch (err) {
    showSnack("Error al cargar categorías", "error");
  }
};


AdminCategorias.mostrarFormulario = function () {
  showInputAlert("Nueva categoría", "Nombre de la categoría", function (nombre) {
    AdminCategorias.crear(nombre);
  });
};


AdminCategorias.crear = async function (nombre) {
  try {
    await API.createCategoria({ nombre });

    showSnack("Categoría creada correctamente", "success");
    AdminCategorias.cargarCategorias();

  } catch (err) {
    showAlert("Error al crear categoría: " + err.message, "error");
  }
};


AdminCategorias.eliminar = function (id) {
  ensureAlertModal();

  document.getElementById("alertTitle").innerHTML = `
  <span style="font-size:20px; font-weight:700;">
    Eliminar categoría
  </span>
`;

document.getElementById("alertMessage").innerHTML = `
  <p style="font-size:15px; margin-bottom:6px; color:#333;">
    ¿Seguro que deseas eliminar esta categoría?
  </p>
  <small style="color:#777;">
    Esta acción no se puede deshacer
  </small>
`;

  const buttons = document.getElementById("alertButtons");
  buttons.innerHTML = `
    <button class="btn btn-secondary w-50" id="cancelBtn">Cancelar</button>
    <button class="btn btn-danger w-50" id="confirmBtn">Eliminar</button>
  `;

  const modal = getModalInstance();

  document.getElementById("cancelBtn").onclick = function () {
    modal.hide();
  };

  document.getElementById("confirmBtn").onclick = async function () {
    try {
      await API.deleteCategoria(id);

      modal.hide();
      showSnack("Categoría eliminada", "success");
      AdminCategorias.cargarCategorias();

    } catch (err) {
      modal.hide();
      showAlert("Error al eliminar: " + err.message, "error");
    }
  };

  modal.show();
};

window.AdminCategorias = AdminCategorias;