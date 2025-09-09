import { verificarUsuario } from "/js/auth-check.js";
import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Função de contagem animada
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

    elemento.classList.add("animando");
    setTimeout(() => elemento.classList.remove("animando"), 100);
    elemento.textContent = inicio;
  }, intervalo);
}

// Espera o DOM carregar
document.addEventListener("DOMContentLoaded", () => {
  verificarUsuario(async (usuario) => {
    // Nome
    const nomeElemento = document.getElementById("nomeUsuario");
    if (nomeElemento) nomeElemento.textContent = usuario.nome || "Usuário";

    // CNPJ
    const empresaCnpjElemento = document.getElementById("empresa-cnpj");
    if (empresaCnpjElemento) {
      try {
        const empresaRef = doc(db, "empresa", "esc001");
        const empresaSnap = await getDoc(empresaRef);
        const cnpj = empresaSnap.exists() ? empresaSnap.data().cnpj : "Não disponível";
        empresaCnpjElemento.textContent = `CNPJ: ${cnpj}`;
      } catch (error) {
        empresaCnpjElemento.textContent = "Erro ao carregar CNPJ";
      }
    }

    // Alunos
    let totalAlunos = 0;
    try {
      const alunosRef = collection(db, "empresa", "esc001", "alunos");
      const snapshotAlunos = await getDocs(alunosRef);
      totalAlunos = snapshotAlunos.size;
      const el = document.getElementById("contador-alunos");
      if (el) animarContagemFlip(el, totalAlunos);
    } catch (error) {
      console.error("Erro ao contar alunos:", error);
    }

    // Funcionários
    let totalFuncionarios = 0;
    try {
      const funcionariosRef = collection(db, "empresa", "esc001", "funcionarios");
      const snapshotFuncionarios = await getDocs(funcionariosRef);
      totalFuncionarios = snapshotFuncionarios.size;
      const el = document.getElementById("contador-funcionarios");
      if (el) animarContagemFlip(el, totalFuncionarios);
    } catch (error) {
      console.error("Erro ao contar funcionários:", error);
    }

    // GRÁFICO DE PIZZA 🍕
    const ctx = document.getElementById("myChart").getContext("2d");
    const meuGraficoPizza = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Alunos", "Funcionários"],
        datasets: [{
          data: [totalAlunos, totalFuncionarios],
          backgroundColor: [
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 99, 132, 0.8)"
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(255, 99, 132, 1)"
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#fff",
              font: {
                size: 14,
                weight: "bold"
              }
            }
          }
        }
      }
    });
  });
});
