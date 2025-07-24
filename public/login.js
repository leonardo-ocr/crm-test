import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDFKt1aJDq9O9hX0PgMnMoTWz343o5bheo",
  authDomain: "https://gestao-escolar-impera.web.app",
  projectId: "gestao-escolar-impera",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    alert("Login bem-sucedido!");
    window.location.href = "dashboard.html";
  } catch (err) {
    alert("Erro: " + err.message);
  }
});
