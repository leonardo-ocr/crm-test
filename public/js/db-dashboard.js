//db-dashboard.js
import { verificarUsuario } from "/js/auth-check.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  verificarUsuario(async (usuario) => {
    console.log("Usuário logado:", usuario);
    
    const nomeElemento = document.getElementById("nomeUsuario");
    if (nomeElemento) {
      nomeElemento.textContent = usuario.nome || "Usuário";
    }

    const empresaCnpjElemento = document.getElementById("empresa-cnpj");
    if (!empresaCnpjElemento) return;

    try {
      const db = getFirestore();
      const empresaRef = doc(db, "empresa", "esc001");
      const empresaSnap = await getDoc(empresaRef);

      if (empresaSnap.exists()) {
        const cnpj = empresaSnap.data().cnpj || "Não disponível";
        empresaCnpjElemento.textContent = `CNPJ: ${cnpj}`;
      } else {
        empresaCnpjElemento.textContent = "Empresa não encontrada";
      }
    } catch (error) {
      console.error("Erro ao buscar dados da empresa:", error);
      empresaCnpjElemento.textContent = "Erro ao carregar CNPJ";
    }
  });
});
