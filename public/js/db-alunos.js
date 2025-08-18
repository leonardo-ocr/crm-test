import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDFKt1aJDq9O9hX0PgMnMoTWz343o5bheo",
  authDomain: "gestao-escolar-impera.firebaseapp.com",
  projectId: "gestao-escolar-impera",
};

// Inicialização
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Agora você pode usar auth e db aqui normalmente.
