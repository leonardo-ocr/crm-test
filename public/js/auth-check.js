//auth-check.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDFKt1aJDq9O9hX0PgMnMoTWz343o5bheo",
  authDomain: "gestao-escolar-impera.firebaseapp.com",
  projectId: "gestao-escolar-impera",
};

// Inicialização
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Função exportada que pode ser usada em qualquer página
export async function verificarUsuario(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.log("Usuário não logado.");
      window.location.href = "/index.html";
      return;
    }

    const uid = user.uid;
    const usuarioRef = doc(db, "empresa", "esc001", "usuario", uid);

    try {
      const usuarioSnap = await getDoc(usuarioRef);

      let dadosUsuario;

      if (usuarioSnap.exists()) {
        dadosUsuario = usuarioSnap.data();
        console.log("✅ Usuário encontrado no Firestore:", dadosUsuario);
      } else {
        console.warn("⚠️ Usuário logado mas não encontrado no Firestore. Criando...");

        dadosUsuario = {
          nome: user.displayName || "Usuário",
          email: user.email || "",
          telefone: "",
          role: "/empresa/esc001/roles/padrao",
          uidUsuario: uid
        };

        await setDoc(usuarioRef, dadosUsuario);
        console.log("✅ Novo usuário criado no Firestore.");
      }

      if (typeof callback === "function") {
        callback(dadosUsuario); // <-- Aqui retorna os dados para a página
      }

    } catch (error) {
      console.error("❌ Erro ao acessar/criar documento do usuário:", error);
    }
  });
}

export async function logoutUsuario() {
  try {
    await auth.signOut();
    localStorage.removeItem("usuarioLogado");
    console.log("Usuário deslogado com sucesso.");
    window.location.href = "/index.html";
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }
}

