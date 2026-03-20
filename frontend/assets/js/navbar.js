function loadNavbar() {
  const raw = localStorage.getItem("shopare_user");
  let user = null;

  try {
    user = JSON.parse(raw);
  } catch {}

  const navbarContainer = document.getElementById("navbar-container");
  if (!navbarContainer) return;

  const basePath =
    window.location.pathname.includes("/cliente") ||
    window.location.pathname.includes("/admin")
      ? ".."
      : ".";

  let html = `
    <style>
      .shopare-navbar-wrapper {
        width: 100%;
        background: #0b0f19;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        box-shadow: 0 6px 20px rgba(0,0,0,0.6);
        position: relative;
        z-index: 1000;
      }

      .shopare-navbar {
        min-height: 76px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 0 10px;
      }

      .shopare-logo {
        text-decoration: none;
        color: #f5f5f5;
        font-size: 28px;
        font-family: "Georgia", "Times New Roman", serif;
        font-style: italic;
        font-weight: 500;
        letter-spacing: 0.5px;
      }

      .shopare-center-menu {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 26px;
        flex: 1;
        flex-wrap: wrap;
      }

      .shopare-link {
        text-decoration: none;
        color: #cfcfcf;
        font-size: 11px;
        letter-spacing: 1.6px;
        text-transform: uppercase;
        font-weight: 600;
        transition: all 0.25s ease;
        position: relative;
      }

      .shopare-link:hover {
        color: #ffffff;
      }

      .shopare-link::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: -5px;
        width: 0;
        height: 1px;
        background: #ffffff;
        transition: width 0.25s ease;
      }

      .shopare-link:hover::after {
        width: 100%;
      }

      .shopare-right {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .shopare-user-text {
        font-size: 12px;
        color: #bdbdbd;
      }

      .shopare-cart {
        text-decoration: none;
        color: #ffffff;
        font-size: 18px;
        transition: transform 0.2s ease, opacity 0.2s ease;
      }

      .shopare-cart:hover {
        transform: scale(1.1);
        opacity: 0.8;
      }

      .shopare-logout {
        text-decoration: none;
        color: #ff6b6b;
        font-size: 11px;
        letter-spacing: 1.2px;
        text-transform: uppercase;
        font-weight: 600;
        transition: 0.25s ease;
      }

      .shopare-logout:hover {
        color: #ff2e2e;
      }

      .shopare-login {
        text-decoration: none;
        color: #cfcfcf;
        font-size: 11px;
        letter-spacing: 1.4px;
        text-transform: uppercase;
        font-weight: 600;
      }

      .shopare-login:hover {
        color: #ffffff;
      }

      .shopare-top-note {
        font-size: 10px;
        color: #8a8f9a;
        letter-spacing: 1.2px;
        text-transform: uppercase;
        text-align: center;
        padding: 8px 12px 0;
      }

      @media (max-width: 991px) {
        .shopare-navbar {
          flex-direction: column;
          padding: 18px 10px;
          gap: 14px;
        }

        .shopare-center-menu {
          gap: 14px;
        }

        .shopare-logo {
          font-size: 24px;
        }
      }
    </style>

    <div class="shopare-navbar-wrapper">
      <div class="shopare-top-note">
        Velvet · Elegancia y estilo en cada compra
      </div>

      <div class="container">
        <nav class="shopare-navbar">
          <a href="${basePath}/index.html" class="shopare-logo">
            Velvet
          </a>

          <div class="shopare-center-menu">
  `;

  if (user?.rol === "cliente") {
    html += `
      <a href="${basePath}/cliente/home.html" class="shopare-link">Inicio</a>
      <a href="${basePath}/cliente/productos.html" class="shopare-link">Productos</a>
      <a href="${basePath}/cliente/pedidos.html" class="shopare-link">Pedidos</a>
      <a href="${basePath}/cliente/soporte.html" class="shopare-link">Contactar</a>
      <a href="${basePath}/cliente/perfil.html" class="shopare-link">Perfil</a>
    `;
  }

  if (user?.rol === "admin") {
    html += `
      <a href="${basePath}/admin/dashboard.html" class="shopare-link">Dashboard</a>
      <a href="${basePath}/admin/productos.html" class="shopare-link">Productos</a>
      <a href="${basePath}/admin/pedidos.html" class="shopare-link">Pedidos</a>
      <a href="${basePath}/admin/soporte.html" class="shopare-link">Soporte</a>
      <a href="${basePath}/admin/clientes.html" class="shopare-link">Gestión de clientes</a>
      <a href="${basePath}/admin/categorias.html" class="shopare-link">Categorías</a>
    `;
  }

  if (!user) {
    html += `
      <a href="${basePath}/login.html" class="shopare-link">Inicio</a>
      <a href="${basePath}/login.html" class="shopare-link">Acceso</a>
    `;
  }

  html += `</div><div class="shopare-right">`;

  if (!user) {
    html += `
      <a href="${basePath}/login.html" class="shopare-login">Iniciar sesión</a>
    `;
  } else {
    html += `
      <span class="shopare-user-text">Hola, ${user.nombre}</span>
      <a href="javascript:void(0)" onclick="logout()" class="shopare-logout">Salir</a>
    `;
  }

  if (user?.rol === "cliente") {
    html += `
      <a href="${basePath}/cliente/carrito.html" class="shopare-cart">🛒</a>
    `;
  }

  html += `</div></nav></div></div>`;

  navbarContainer.innerHTML = html;
}

function logout() {
  localStorage.removeItem("shopare_user");
  showSnack("Sesión cerrada correctamente");

  const goTo =
    window.location.pathname.includes("/cliente") ||
    window.location.pathname.includes("/admin")
      ? "../login.html"
      : "./login.html";

  setTimeout(() => {
    window.location.href = goTo;
  }, 800);
}

function showSnack(message) {
  let bar = document.getElementById("globalSnack");

  if (!bar) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <div id="globalSnack"
           style="
             visibility:hidden;
             min-width:250px;
             background:#333;
             color:#fff;
             text-align:center;
             border-radius:6px;
             padding:14px;
             position:fixed;
             left:50%;
             bottom:30px;
             transform:translateX(-50%);
             z-index:9999;
             font-size:16px;
             opacity:0;
             transition:opacity .3s ease, bottom .3s ease;">
      </div>
    `
    );
    bar = document.getElementById("globalSnack");
  }

  bar.innerText = message;
  bar.style.visibility = "visible";
  bar.style.opacity = "1";
  bar.style.bottom = "50px";

  setTimeout(() => {
    bar.style.opacity = "0";
    bar.style.bottom = "20px";
    setTimeout(() => {
      bar.style.visibility = "hidden";
    }, 300);
  }, 2200);
}

document.addEventListener("DOMContentLoaded", () => {
  loadNavbar();
});