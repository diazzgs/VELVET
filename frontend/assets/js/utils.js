
function formatMoney(num) {
  return "L " + Number(num).toFixed(2);
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function getToken() {
  return localStorage.getItem("shopare_token");
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("shopare_user"));
  } catch {
    return null;
  }
}

function requireAuth(roles = []) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    window.location.href = "/login.html";
    return;
  }

  if (roles.length > 0 && !roles.includes(user.rol)) {
    window.location.href = "/404.html";
    return;
  }
}

function logout() {
  localStorage.removeItem("shopare_token");
  localStorage.removeItem("shopare_user");
  window.location.href = "/login.html";
}

window.Utils = {
  formatMoney,
  getParam,
  getToken,
  getUser,
  requireAuth,
  logout
};


function ensureAlertModal() {
  if (document.getElementById("alertModal")) return;

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div class="modal fade" id="alertModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content p-4 text-center">

          <h4 id="alertTitle" class="fw-bold mb-2"></h4>
          <p id="alertMessage" class="mb-3"></p>

          <div id="alertButtons" class="d-flex justify-content-center gap-2"></div>

        </div>
      </div>
    </div>
    `
  );
}

function showAlert(message, type = "info", callback = null) {
  ensureAlertModal();

  const title = {
    success: "✔ Éxito",
    error: "✖ Error",
    info: "ℹ Aviso"
  }[type] || "ℹ Aviso";

  document.getElementById("alertTitle").innerText = title;
  document.getElementById("alertMessage").innerText = message;

  const buttons = document.getElementById("alertButtons");
  buttons.innerHTML = `
    <button class="btn btn-primary w-50" id="alertAcceptBtn">Aceptar</button>
  `;

  const btn = document.getElementById("alertAcceptBtn");
  btn.onclick = () => {
    if (callback) callback();

    if (window.bootstrap && bootstrap.Modal) {
      const modalEl = document.getElementById("alertModal");
      const bsModal = bootstrap.Modal.getInstance(modalEl);
      if (bsModal) bsModal.hide();
    }
  };

  
  if (window.bootstrap && bootstrap.Modal) {
    const modalEl = document.getElementById("alertModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}

window.showAlert = showAlert;

function ensureSnackContainer() {
  if (!document.getElementById("snackContainer")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <div id="snackContainer"
           style="position:fixed; bottom:20px; right:20px; z-index:99999;">
      </div>
      `
    );
  }
}

function showSnack(message, type = "success", duration = 2200) {
  ensureSnackContainer();

  const container = document.getElementById("snackContainer");

  const el = document.createElement("div");
  el.className = "snackbar-item";
  el.innerHTML = message;

 
  el.style.cssText = `
    background: ${type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#333"};
    color: #fff;
    padding: 12px 18px;
    border-radius: 8px;
    margin-top: 10px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.15);
    font-weight: 600;
    opacity: 0;
    transform: translateY(10px);
    transition: all .35s ease;
    max-width: 340px;
  `;

  container.appendChild(el);

  setTimeout(() => {
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
  }, 20);

  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(10px)";
    setTimeout(() => el.remove(), 350);
  }, duration);
}

window.showSnack = showSnack;
