import { verificarUsuario } from "/js/auth-check.js";
import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Função de contagem animada com efeito de "flip"
function animarContagemFlip(elemento, valorFinal, duracao = 800) {
  let inicio = 0;
  const intervalo = 20;
  const passos = Math.floor(duracao / intervalo);
  const incremento = Math.max(1, Math.ceil(valorFinal / passos));

  const contador = setInterval(() => {
    inicio += incremento;
    if (inicio >= valorFinal) {
      inicio = valorFinal;
      clearInterval(contador);
    }

    // Aplica classe de animação
    elemento.classList.add("animando");
    setTimeout(() => elemento.classList.remove("animando"), 100);

    elemento.textContent = inicio;
  }, intervalo);
}

document.addEventListener("DOMContentLoaded", () => {
  verificarUsuario(async (usuario) => {
    console.log("Usuário logado:", usuario);

    // Nome do usuário
    const nomeElemento = document.getElementById("nomeUsuario");
    if (nomeElemento) {
      nomeElemento.textContent = usuario.nome || "Usuário";
    }

    // CNPJ da empresa
    const empresaCnpjElemento = document.getElementById("empresa-cnpj");
    if (empresaCnpjElemento) {
      try {
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
    }

    // 🔢 Contador de alunos com animação flip
    try {
      const alunosRef = collection(db, "empresa", "esc001", "alunos");
      const snapshot = await getDocs(alunosRef);
      const totalAlunos = snapshot.size;

      const contadorElemento = document.getElementById("contador-alunos");
      if (contadorElemento) {
        animarContagemFlip(contadorElemento, totalAlunos); // Com efeito flip
      }
    } catch (error) {
      console.error("Erro ao contar alunos:", error);
    }
  });
});
