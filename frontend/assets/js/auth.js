// =======================
// GUARDAR SESIÓN
// =======================
function saveSession(token, user) {
  localStorage.setItem("shopare_token", token);

  localStorage.setItem("shopare_user", JSON.stringify({
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    telefono: user.telefono || "",
    direccion: user.direccion || ""
  }));
}

// =======================
// LOGOUT
// =======================
function logout() {
  showSnack("Se cerró sesión con éxito", "success");

  localStorage.removeItem("shopare_token");
  localStorage.removeItem("shopare_user");

  setTimeout(() => {
    // 🔥 funciona desde /admin o /cliente
    window.location.href = "../login.html";
  }, 800);
}

// =======================
// USUARIO ACTUAL
// =======================
function currentUser() {
  const raw = localStorage.getItem("shopare_user");
  try {
    return JSON.parse(raw) || null;
  } catch {
    return null;
  }
}

// =======================
// PROTEGER RUTAS
// =======================
function requireAuth(roles = []) {
  const user = currentUser();
  const token = localStorage.getItem("shopare_token");

  if (!user || !token) {
    window.location.href = "../login.html";
    return;
  }

  if (roles.length > 0 && !roles.includes(user.rol)) {
    window.location.href = "../404.html";
    return;
  }
}

// =======================
// LOGIN
// =======================
async function handleLogin(event) {
  event.preventDefault();

  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value.trim();

  if (!email || !password) {
    showAlert("Completa todos los campos.");
    return;
  }

  try {
    const res = await API.login(email, password);

    const usuario = res.usuario || res.user;

    if (!res.token || !usuario) {
      throw new Error("Respuesta inválida del servidor");
    }

    saveSession(res.token, usuario);

    // 🔥 desde login.html (raíz de frontend)
    if (usuario.rol === "admin") {
      window.location.href = "admin/dashboard.html";
    } else {
      window.location.href = "cliente/home.html";
    }

  } catch (err) {
    console.error(err);
    showAlert("Credenciales incorrectas.", "error");
  }
}

// =======================
// REGISTER
// =======================
async function handleRegister(event) {
  event.preventDefault();

  const nombre = document.querySelector("#nombre").value.trim();
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value.trim();
  const password2 = document.querySelector("#password2").value.trim();
  const telefono = document.querySelector("#telefono").value.trim();
  const direccion = document.querySelector("#direccion").value.trim();

  if (!nombre || !email || !password || !password2) {
    showAlert("Completa todos los campos obligatorios.", "error");
    return;
  }

  if (password !== password2) {
    showAlert("Las contraseñas no coinciden.", "error");
    return;
  }

  try {
    await API.registerUser({
      nombre,
      email,
      password,
      telefono,
      direccion
    });

    showAlert("Registro exitoso. Ahora puedes iniciar sesión.", "success", () => {
      window.location.href = "login.html";
    });

  } catch (err) {
    console.error(err);
    showAlert(err.message || "Error al registrarse.", "error");
  }
}

// =======================
// REDIRECCIÓN AUTOMÁTICA
// =======================
function redirectIfLoggedIn() {
  const user = currentUser();

  if (user?.rol === "admin") {
    window.location.href = "admin/dashboard.html";
  }

  if (user?.rol === "cliente") {
    window.location.href = "cliente/home.html";
  }
}

// =======================
// EXPORT GLOBAL
// =======================
window.Auth = {
  handleLogin,
  handleRegister,
  logout,
  requireAuth,
  redirectIfLoggedIn,
  currentUser
};