import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDFKt1aJDq9O9hX0PgMnMoTWz343o5bheo",
  authDomain: "gestao-escolar-impera.firebaseapp.com",
  projectId: "gestao-escolar-impera"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Buscar CNPJ da empresa esc001
async function exibirCNPJ() {
  try {
    const ref = doc(db, "empresa", "esc001");
    const snapshot = await getDoc(ref);

    if (snapshot.exists()) {
      const dados = snapshot.data();
      const cnpj = dados.cnpj;

      // Atualizar no HTML
      const cnpjEl = document.getElementById("empresa-cnpj");
      if (cnpjEl) {
        cnpjEl.textContent = `CNPJ: ${cnpj}`;
      }
    } else {
      console.warn("Documento empresa/esc001 não encontrado");
    }
  } catch (err) {
    console.error("Erro ao buscar CNPJ:", err);
  }
}

window.addEventListener("DOMContentLoaded", exibirCNPJ);
