const SoporteCliente = {};
const SoporteAdmin = {};

function soporteFormatFecha(fecha) {
  try {
    return new Date(fecha).toLocaleString("es-HN");
  } catch {
    return "";
  }
}

function soporteEscape(v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function soporteScrollBottom(el) {
  if (!el) return;
  el.scrollTop = el.scrollHeight;
}

// =======================
// CLIENTE
// =======================
SoporteCliente.state = {
  polling: null,
  lastCount: 0
};

SoporteCliente.render = function (mensajes) {
  const box = document.getElementById("chatBox");
  const status = document.getElementById("soporteStatus");
  if (!box) return;

  if (!Array.isArray(mensajes) || mensajes.length === 0) {
    box.innerHTML = `
      <div class="p-3" style="border:1px solid rgba(255,255,255,0.10);">
        <strong>Inicia una conversación</strong>
        <div class="small" style="color:#cbd5e1;">Envía tu primer mensaje y un admin te responderá.</div>
      </div>
    `;
    if (status) status.textContent = "";
    return;
  }

  box.innerHTML = mensajes.map(m => {
    const isMe = m.sender_rol === "cliente";
    const nombre = m.Usuario?.nombre || (m.sender_rol === "admin" ? "Admin" : "Tú");
    return `
      <div class="msg ${isMe ? "me" : ""}">
        <div class="bubble">
          <div>${soporteEscape(m.mensaje)}</div>
          <div class="meta">${soporteEscape(nombre)} · ${soporteFormatFecha(m.createdAt)}</div>
        </div>
      </div>
    `;
  }).join("");

  if (status) status.textContent = `Mensajes: ${mensajes.length}`;
};

SoporteCliente.refresh = async function () {
  try {
    const res = await API.soporteMisMensajes();
    const mensajes = res?.mensajes || [];
    SoporteCliente.render(mensajes);

    if (mensajes.length !== SoporteCliente.state.lastCount) {
      SoporteCliente.state.lastCount = mensajes.length;
      soporteScrollBottom(document.getElementById("chatBox"));
    }
  } catch (e) {
    const box = document.getElementById("chatBox");
    if (box) box.innerHTML = `<p>Error al cargar mensajes.</p>`;
  }
};

SoporteCliente.init = function () {
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");

  SoporteCliente.refresh();
  SoporteCliente.state.polling = setInterval(SoporteCliente.refresh, 3000);

  if (form) {
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const texto = String(input?.value || "").trim();
      if (!texto) return;

      if (input) input.value = "";
      try {
        await API.soporteEnviarMensaje(texto);
        await SoporteCliente.refresh();
        soporteScrollBottom(document.getElementById("chatBox"));
      } catch (e) {
        showSnack("No se pudo enviar el mensaje", "error");
      }
    });
  }
};

// =======================
// ADMIN
// =======================
SoporteAdmin.state = {
  pollingList: null,
  pollingChat: null,
  activeConvId: null,
  lastChatCount: 0
};

SoporteAdmin.renderList = function (convs) {
  const list = document.getElementById("convList");
  const status = document.getElementById("adminSoporteStatus");
  if (!list) return;

  if (!Array.isArray(convs) || convs.length === 0) {
    list.innerHTML = `<div class="p-3" style="color:#cbd5e1;">No hay conversaciones.</div>`;
    if (status) status.textContent = "";
    return;
  }

  if (status) status.textContent = `${convs.length} conversación(es)`;

  list.innerHTML = convs.map(c => {
    const active = String(c.id) === String(SoporteAdmin.state.activeConvId);
    const cliente = c.Usuario?.nombre || `Cliente #${c.cliente_id}`;
    const email = c.Usuario?.email || "";
    return `
      <div class="item ${active ? "active" : ""}" onclick="SoporteAdmin.openConv(${Number(c.id)})">
        <div class="fw-bold">${soporteEscape(cliente)}</div>
        <div class="small" style="color:#cbd5e1;">${soporteEscape(email)} · ${soporteEscape(c.estado)}</div>
      </div>
    `;
  }).join("");
};

SoporteAdmin.refreshList = async function () {
  try {
    const convs = await API.soporteConversacionesAdmin();
    SoporteAdmin.renderList(convs || []);
  } catch (e) {
    const list = document.getElementById("convList");
    if (list) list.innerHTML = `<div class="p-3">Error al cargar conversaciones.</div>`;
  }
};

SoporteAdmin.renderChat = function (payload) {
  const chat = document.getElementById("adminChat");
  const title = document.getElementById("convTitle");
  const btnCerrar = document.getElementById("btnCerrarConv");
  if (!chat) return;

  const conv = payload?.conversacion;
  const mensajes = payload?.mensajes || [];

  if (!conv) {
    chat.innerHTML = `<div class="p-3" style="color:#cbd5e1;">Selecciona una conversación.</div>`;
    if (title) title.textContent = "Selecciona una conversación";
    if (btnCerrar) btnCerrar.style.display = "none";
    return;
  }

  const cliente = conv.Usuario?.nombre || `Cliente #${conv.cliente_id}`;
  if (title) title.textContent = `${cliente} · #${conv.id}`;
  if (btnCerrar) btnCerrar.style.display = conv.estado === "abierto" ? "inline-block" : "none";

  chat.innerHTML = mensajes.map(m => {
    const isMe = m.sender_rol === "admin";
    const nombre = m.Usuario?.nombre || (m.sender_rol === "admin" ? "Tú" : "Cliente");
    return `
      <div class="msg ${isMe ? "me" : ""}">
        <div class="bubble">
          <div>${soporteEscape(m.mensaje)}</div>
          <div class="meta">${soporteEscape(nombre)} · ${soporteFormatFecha(m.createdAt)}</div>
        </div>
      </div>
    `;
  }).join("");

  if (mensajes.length !== SoporteAdmin.state.lastChatCount) {
    SoporteAdmin.state.lastChatCount = mensajes.length;
    soporteScrollBottom(chat);
  }
};

SoporteAdmin.refreshChat = async function () {
  if (!SoporteAdmin.state.activeConvId) return;
  try {
    const payload = await API.soporteConversacionAdmin(SoporteAdmin.state.activeConvId);
    SoporteAdmin.renderChat(payload);
  } catch (e) {
    const chat = document.getElementById("adminChat");
    if (chat) chat.innerHTML = `<div class="p-3">Error al cargar mensajes.</div>`;
  }
};

SoporteAdmin.openConv = async function (id) {
  SoporteAdmin.state.activeConvId = id;
  SoporteAdmin.state.lastChatCount = 0;
  await SoporteAdmin.refreshList();
  await SoporteAdmin.refreshChat();
};

SoporteAdmin.init = function () {
  const form = document.getElementById("adminChatForm");
  const input = document.getElementById("adminChatInput");
  const btnCerrar = document.getElementById("btnCerrarConv");

  SoporteAdmin.refreshList();
  SoporteAdmin.state.pollingList = setInterval(SoporteAdmin.refreshList, 4000);
  SoporteAdmin.state.pollingChat = setInterval(SoporteAdmin.refreshChat, 3000);

  if (form) {
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const texto = String(input?.value || "").trim();
      if (!texto || !SoporteAdmin.state.activeConvId) return;

      if (input) input.value = "";
      try {
        await API.soporteResponderAdmin(SoporteAdmin.state.activeConvId, texto);
        await SoporteAdmin.refreshChat();
        soporteScrollBottom(document.getElementById("adminChat"));
      } catch (e) {
        showSnack("No se pudo enviar la respuesta", "error");
      }
    });
  }

  if (btnCerrar) {
    btnCerrar.addEventListener("click", async () => {
      if (!SoporteAdmin.state.activeConvId) return;
      try {
        await API.soporteCerrarAdmin(SoporteAdmin.state.activeConvId);
        await SoporteAdmin.refreshChat();
        await SoporteAdmin.refreshList();
        showSnack("Conversación cerrada", "success");
      } catch (e) {
        showSnack("No se pudo cerrar", "error");
      }
    });
  }
};

window.SoporteCliente = SoporteCliente;
window.SoporteAdmin = SoporteAdmin;

