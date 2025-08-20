import { logoutUsuario } from "./auth-check.js";

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.querySelector("#btn-logout");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logoutUsuario();
    });
  }
});
