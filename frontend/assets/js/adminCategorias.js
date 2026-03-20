const AdminCategorias = {};

AdminCategorias.cargarCategorias = async function () {
  const cont = document.getElementById("lista-categorias");
  cont.innerHTML = "<p>Cargando...</p>";

  try {
    const categorias = await API.getCategorias();

    if (categorias.length === 0) {
      cont.innerHTML = "<p>No hay categorías registradas.</p>";
      return;
    }

    let html = `
      <table class="table table-bordered table-striped">
        <tbody>
    `;

    categorias.forEach((cat, index) => {
      const imagenes = [
        "../assets/img/hero1.jpg",
        "../assets/img/bg2.jpg",
        "../assets/img/fondo-vogue.jpg"
      ];

      const imagen = imagenes[index % imagenes.length];

      html += `
        <tr>
          <td style="
            height: 220px;
            background-image: url('${imagen}');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            border: none;
            padding: 0;
          "></td>

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
    cont.innerHTML = "<p>Error al cargar categorías.</p>";
  }
};

AdminCategorias.mostrarFormulario = function () {
  const nombre = prompt("Ingrese el nombre de la nueva categoría:");

  if (!nombre) return;

  AdminCategorias.crear(nombre);
};

AdminCategorias.crear = async function (nombre) {
  try {
    await API.createCategoria({ nombre });

    alert("Categoría registrada con éxito");
    AdminCategorias.cargarCategorias();
  } catch (err) {
    alert("Error al crear categoría: " + err.message);
  }
};

AdminCategorias.eliminar = async function (id) {
  const confirmar = confirm("¿Seguro que deseas eliminar esta categoría?");
  if (!confirmar) return;

  try {
    await API.deleteCategoria(id);
    alert("Categoría eliminada con éxito");
    AdminCategorias.cargarCategorias();
  } catch (err) {
    alert("Error al eliminar categoría: " + err.message);
  }
};

window.AdminCategorias = AdminCategorias;