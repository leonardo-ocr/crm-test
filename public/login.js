import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDFKt1aJDq9O9hX0PgMnMoTWz343o5bheo",
  authDomain: "gestao-escolar-impera.firebaseapp.com",
  projectId: "gestao-escolar-impera",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, senha);
    const user = cred.user;

    const empresasSnapshot = await getDocs(collection(db, "empresas"));
    let empresaEncontrada = null;

    for (const empresaDoc of empresasSnapshot.docs) {
      const usuarioRef = doc(db, "empresas", empresaDoc.id, "usuarios", user.uid);
      const usuarioSnap = await getDoc(usuarioRef);

      if (usuarioSnap.exists()) {
        const dadosUsuario = usuarioSnap.data();
        empresaEncontrada = empresaDoc.id;

        if (dadosUsuario.role === "admin") {
          window.location.href = "painel-admin.html";
        } else {
          window.location.href = "dashboard.html";
        }

        return;
      }
    }

    alert("Usuário não vinculado a nenhuma empresa.");
  } catch (err) {
    alert("Erro no login: " + err.message);
  }
});
