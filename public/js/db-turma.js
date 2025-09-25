import { query, where } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { db } from './firebase-config.js';
import {
  collection,
  addDoc,
  getDocs
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ✅ Variável global para uso em todo o script
const empresaId = "esc001";
let turmasCarregadas = [];

document.addEventListener("DOMContentLoaded", () => {


  // Filtros de série, ano e turma
  const filtroSerie = document.getElementById("filtroSerie");
  const filtroAno = document.getElementById("filtroAno");
  const filtroTurma = document.getElementById("filtroTurma");

  const dados = {
    infantil: {
      "1º Ano": ["Turma A", "Turma B"],
      "2º Ano": ["Turma A", "Turma B"]
    },
    fund1: {
      "1º Ano": ["Turma A", "Turma B"],
      "2º Ano": ["Turma A", "Turma C"],
      "3º Ano": ["Turma A", "Turma B", "Turma D"]
    },
    fund2: {
      "6º Ano": ["Turma A"],
      "7º Ano": ["Turma A", "Turma B"]
    },
    medio: {
      "1º Ano": ["Turma A"],
      "2º Ano": ["Turma A", "Turma B"],
      "3º Ano": ["Turma A"]
    }
  };

  // Lógica dos filtros
  filtroSerie.addEventListener("change", function () {
    const serie = filtroSerie.value;
    filtroAno.innerHTML = '<option value="">Selecione o Ano</option>';
    filtroTurma.innerHTML = '<option value="">Selecione a Turma</option>';
    filtroAno.disabled = true;
    filtroTurma.disabled = true;

    if (serie && dados[serie]) {
      Object.keys(dados[serie]).forEach(ano => {
        const opt = document.createElement("option");
        opt.value = ano;
        opt.textContent = ano;
        filtroAno.appendChild(opt);
      });
      filtroAno.disabled = false;
    }
  });

  filtroAno.addEventListener("change", function () {
    const serie = filtroSerie.value;
    const ano = filtroAno.value;
    filtroTurma.innerHTML = '<option value="">Selecione a Turma</option>';
    filtroTurma.disabled = true;

    if (serie && ano && dados[serie][ano]) {
      dados[serie][ano].forEach(turma => {
        const opt = document.createElement("option");
        opt.value = turma;
        opt.textContent = turma;
        filtroTurma.appendChild(opt);
      });
      filtroTurma.disabled = false;
    }
  });

  filtroTurma.addEventListener("change", function () {
    const serie = filtroSerie.value;
    const ano = filtroAno.value;
    const turma = filtroTurma.value;

    if (turma) {
      console.log(`Selecionado: ${serie} > ${ano} > ${turma}`);
    }
  });

  // Cadastro da turma com Firebase
  const formNovaTurma = document.getElementById('formNovaTurma');
  const modalNovaTurma = document.getElementById('modalNovaTurma');
  const addClassBtn = document.getElementById('addClassBtn');
  const fecharModal = document.getElementById('fecharModal');

  if (addClassBtn) {
    addClassBtn.onclick = () => {
      modalNovaTurma.style.display = "block";
      modalNovaTurma.setAttribute("aria-hidden", "false");
    };
  }

  if (fecharModal) {
    fecharModal.onclick = () => {
      modalNovaTurma.style.display = "none";
      modalNovaTurma.setAttribute("aria-hidden", "true");
    };
  }

  window.onclick = (event) => {
    if (event.target === modalNovaTurma) {
      modalNovaTurma.style.display = "none";
      modalNovaTurma.setAttribute("aria-hidden", "true");
    }
  };

  if (formNovaTurma) {
    formNovaTurma.onsubmit = async (e) => {
  e.preventDefault();

  const nomeTurma = document.getElementById("nomeTurma").value.trim();
  const periodo = document.getElementById("periodoTurma").value.trim();
  const ano = document.getElementById("anoTurma").value.trim();
  const serie = document.getElementById("serieTurma").value.trim();

  if (!nomeTurma || !serie || !periodo || !ano) {
    alert("Por favor, preencha todos os campos.");
    return;
  }
      // 🚫 Verifica termos proibidos (opcional)
      const termosProibidos = ['nigger', 'palavrão1', 'offensive','buiu'];
      if (termosProibidos.some(palavra => nomeTurma.toLowerCase().includes(palavra))) {
        alert("O nome da turma contém termos proibidos.");
        return;
      }

      const novaTurma = {
        turma: nomeTurma,
        série: serie,
        período: periodo,
        ano: `${ano}º Ano`,
        idResponsavel: "",
      };

      try {
        const turmasRef = collection(db, "empresa", empresaId, "turmas");
        await addDoc(turmasRef, novaTurma);

        alert("Turma adicionada com sucesso!");
        formNovaTurma.reset();
        modalNovaTurma.style.display = "none";
        modalNovaTurma.setAttribute("aria-hidden", "true");
        location.reload(); // atualize a lista se necessário
      } catch (error) {
        console.error("Erro ao adicionar turma:", error);
        alert("Erro ao adicionar turma.");
      }
    };
  }

  // ⚠️ Chamada para carregar turmas após DOM carregar
  carregarTurmas();
});

// 🔄 Carrega as turmas cadastradas e renderiza os cards
const turmasContainer = document.getElementById("turmasContainer");

async function carregarTurmas() {
  try {
    const turmasRef = collection(db, "empresa", empresaId, "turmas");
    const snapshot = await getDocs(turmasRef);

    turmasCarregadas = []; // limpa o array toda vez que carregar

    const promessas = snapshot.docs.map(async (doc) => {
      const turma = doc.data();
      const turmaId = doc.id;
      const qtdAlunos = await contarAlunosPorTurma(turmaId);

      return {
        id: turmaId,
        dados: turma,
        qtdAlunos
      };
    });

    turmasCarregadas = await Promise.all(promessas);

    renderizarTurmas(turmasCarregadas);

  } catch (error) {
    console.error("Erro ao carregar turmas:", error);
    turmasContainer.innerHTML = `<p>Erro ao carregar turmas.</p>`;
  }
}

function renderizarTurmas(listaTurmas) {
  turmasContainer.innerHTML = "";

  if (listaTurmas.length === 0) {
    turmasContainer.innerHTML = "<p>Nenhuma turma encontrada para a busca.</p>";
    return;
  }

  listaTurmas.forEach(({ id, dados, qtdAlunos }) => {
    const card = document.createElement("div");
    card.classList.add("card-turma");

    card.innerHTML = `
      <h3>${dados.turma}</h3>
      <p><strong>Série:</strong> ${dados.série}</p>
      <p><strong>Ano:</strong> ${dados.ano}</p>
      <p><strong>Período:</strong> ${dados.período}</p>
      <p><strong>Alunos:</strong> ${qtdAlunos}</p>
    `;

    card.style.cursor = "pointer";
    card.onclick = () => abrirModalTurma(id, dados);

    turmasContainer.appendChild(card);
  });
}



function abrirModalTurma(turmaId, turma) {
  const modal = document.getElementById("modalDetalhesTurma");
  const conteudo = document.getElementById("conteudoDetalhesTurma");

  conteudo.innerHTML = `
    <h2>${turma.turma}</h2>
    <p><strong>Série:</strong> ${turma.série}</p>
    <p><strong>Ano:</strong> ${turma.ano}</p>
    <p><strong>Período:</strong> ${turma.período}</p>
    <hr />
    <p><em>🧑‍🏫 Lista de Professores (em breve)</em></p>
    <p><em>👩‍🎓 Lista de Alunos (em breve)</em></p>
  `;

  modal.style.display = "block";
  modal.setAttribute("aria-hidden", "false");
}

// Fecha o modal de detalhes da turma
document.getElementById("fecharModalTurma").onclick = () => {
  const modal = document.getElementById("modalDetalhesTurma");
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
};

window.onclick = (event) => {
  const modal = document.getElementById("modalDetalhesTurma");
  if (event.target === modal) {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  }
};

// Função para contar alunos de uma turma
async function contarAlunosPorTurma(turmaId) {
  try {
    const alunosRef = collection(db, "empresa", empresaId, "alunos");
    const q = query(alunosRef, where("idTurma", "==", turmaId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size; // Retorna o número de alunos na turma
  } catch (error) {
    console.error("Erro ao contar alunos:", error);
    return 0; // Em caso de erro, retorna 0
  }
}

const searchInput = document.getElementById("searchInput");

if (searchInput) {
  searchInput.addEventListener("input", function () {
    const textoBusca = this.value.trim();
    filtrarTurmasPorBusca(textoBusca);
  });
}

function filtrarTurmasPorBusca(textoBusca) {
  textoBusca = textoBusca.toLowerCase();

  const turmasFiltradas = turmasCarregadas.filter(({ dados }) => {
    return (
      dados.turma.toLowerCase().includes(textoBusca) ||
      dados.série.toLowerCase().includes(textoBusca) ||
      dados.ano.toLowerCase().includes(textoBusca) ||
      dados.período.toLowerCase().includes(textoBusca)
    );
  });

  renderizarTurmas(turmasFiltradas);
}


