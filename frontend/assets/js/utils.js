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


// ================= MODAL BASE =================

function ensureAlertModal() {
  if (document.getElementById("alertModal")) return;

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div class="modal fade" id="alertModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content p-4 text-center">
          <h4 id="alertTitle" class="fw-bold mb-2"></h4>
          <div id="alertMessage" class="mb-3"></div>
          <div id="alertButtons" class="d-flex justify-content-center gap-2"></div>
        </div>
      </div>
    </div>
    `
  );
}

function getModalInstance() {
  const modalEl = document.getElementById("alertModal");
  return bootstrap.Modal.getOrCreateInstance(modalEl);
}


// ================= ALERT =================

function showAlert(message, type = "info", callback = null) {
  ensureAlertModal();

  const titles = {
    success: "✔ Éxito",
    error: "✖ Error",
    info: "ℹ Aviso"
  };

  document.getElementById("alertTitle").innerText =
    titles[type] || "ℹ Aviso";

  document.getElementById("alertMessage").innerText = message;

  const buttons = document.getElementById("alertButtons");
  buttons.innerHTML = `
    <button class="btn btn-primary w-50" id="alertAcceptBtn">Aceptar</button>
  `;

  const modal = getModalInstance();

  document.getElementById("alertAcceptBtn").onclick = () => {
    if (callback) callback();
    modal.hide();
  };

  modal.show();
}

window.showAlert = showAlert;


// ================= INPUT MODAL =================

function showInputAlert(title, placeholder, callback) {
  ensureAlertModal();

  document.getElementById("alertTitle").innerText = title;

  document.getElementById("alertMessage").innerHTML = `
    <input id="alertInput" class="form-control mt-2" placeholder="${placeholder}">
  `;

  const buttons = document.getElementById("alertButtons");
  buttons.innerHTML = `
    <button class="btn btn-secondary w-50" id="cancelBtn">Cancelar</button>
    <button class="btn btn-primary w-50" id="saveBtn">Guardar</button>
  `;

  const modal = getModalInstance();

  document.getElementById("cancelBtn").onclick = () => {
    modal.hide();
  };

  document.getElementById("saveBtn").onclick = () => {
    const value = document.getElementById("alertInput").value.trim();

    if (!value) {
      showSnack("El campo es obligatorio", "error");
      return;
    }

    modal.hide();
    if (callback) callback(value);
  };

  modal.show();
}

window.showInputAlert = showInputAlert;


// ================= SNACKBAR =================

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
  el.innerText = message;

  el.style.background =
    type === "success" ? "#28a745" :
    type === "error" ? "#dc3545" : "#333";

  el.style.color = "#fff";
  el.style.padding = "12px 18px";
  el.style.borderRadius = "8px";
  el.style.marginTop = "10px";
  el.style.boxShadow = "0 6px 18px rgba(0,0,0,0.15)";
  el.style.fontWeight = "600";
  el.style.opacity = "0";
  el.style.transform = "translateY(10px)";
  el.style.transition = "all .35s ease";
  el.style.maxWidth = "340px";

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