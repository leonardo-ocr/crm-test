import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDFKt1aJDq9O9hX0PgMnMoTWz343o5bheo",
  authDomain: "gestao-escolar-impera.firebaseapp.com",
  projectId: "gestao-escolar-impera"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Verifica o estado de autenticação
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    const userDocRef = doc(db, "empresa", "esc001", "usuario", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      console.log("Usuário encontrado:", userDocSnap.data());
    } else {
      console.warn("Usuário logado mas não encontrado no Firestore. Criando...");

      await setDoc(userDocRef, {
        nome: user.displayName || "Usuário",
        email: user.email || "",
        telefone: "",
        role: "/empresa/esc001/roles/padrao",
        uidUsuario: uid
      });

      console.log("Usuário criado no Firestore.");
    }
  } else {
    console.log("Usuário não logado.");
    // Se quiser redirecionar para login:
    // window.location.href = "/login.html";
  }
});
