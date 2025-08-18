// ===================== Firebase Imports =====================
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

// ===================== Configuração Firebase =====================
const firebaseConfig = {
  apiKey: "AIzaSyDFKt1aJDq9O9hX0PgMnMoTWz343o5bheo",
  authDomain: "gestao-escolar-impera.firebaseapp.com",
  projectId: "gestao-escolar-impera",
};

// ===================== Inicialização Firebase =====================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===================== Verificação do Usuário =====================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.log("Usuário não logado.");
    // Redirecionar para login se necessário
    window.location.href = "/index.html";
    return;
  }

  const uid = user.uid;
  const usuarioRef = doc(db, "empresa", "esc001", "usuario", uid);

  try {
    const usuarioSnap = await getDoc(usuarioRef);

    if (usuarioSnap.exists()) {
      console.log("✅ Usuário encontrado no Firestore:", usuarioSnap.data());
    } else {
      console.warn("⚠️ Usuário logado mas não encontrado no Firestore. Criando...");

      const novoUsuario = {
        nome: user.displayName || "Usuário",
        email: user.email || "",
        telefone: "",
        role: "/empresa/esc001/roles/padrao", // Ajuste conforme necessário
        uidUsuario: uid
      };

      await setDoc(usuarioRef, novoUsuario);
      console.log("✅ Novo usuário criado no Firestore.");
    }
  } catch (error) {
    console.error("❌ Erro ao acessar ou criar o documento do usuário:", error);
  }
});
