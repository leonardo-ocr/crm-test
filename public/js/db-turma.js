import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

import { db } from './firebase-config.js';
import { initFuncionarios, getProfessoresDisponiveis } from './db-rh.js';

const empresaId = "esc001";
let turmasCarregadas = [];

const nomesSeries = {
  infantil: "Educação Infantil",
  fundamental1: "Ensino Fundamental 1",
  fundamental2: "Ensino Fundamental 2",
  medio: "Ensino Médio"
};

const dados = {
  infantil: { "Berçário": [], "Maternal 1": [], "Maternal 2": [], "Jardim": [], "Jardim 1": [], "Pré": [] },
  fundamental1: { "1º Ano": [], "2º Ano": [], "3º Ano": [], "4º Ano": [], "5º Ano": [] },
  fundamental2: { "6º Ano": [], "7º Ano": [], "8º Ano": [], "9º Ano": [] },
  medio: { "1º Ano": [], "2º Ano": [], "3º Ano": [] }
};

document.addEventListener("DOMContentLoaded", async () => {
  const filtroSerie = document.getElementById("filtroSerie");
  const filtroAno = document.getElementById("filtroAno");
  const searchInput = document.getElementById("searchInput");
  const turmasContainer = document.getElementById("turmasContainer");

  // Carrega filtros ao iniciar
  inicializarFiltroSerie();

  filtroSerie.addEventListener("change", () => {
    atualizarFiltroAno();
    aplicarFiltrosComBusca();
  });

  filtroAno.addEventListener("change", aplicarFiltrosComBusca);
  searchInput.addEventListener("input", aplicarFiltrosComBusca);

  await carregarTurmas(); // carrega dados do Firestore

  function inicializarFiltroSerie() {
    filtroSerie.innerHTML = `<option value="">Todas as Séries</option>`;
    for (const serie in nomesSeries) {
      const opt = document.createElement("option");
      opt.value = serie;
      opt.textContent = nomesSeries[serie];
      filtroSerie.appendChild(opt);
    }
  }

  function atualizarFiltroAno() {
    const serie = filtroSerie.value;
    filtroAno.innerHTML = `<option value="">Todas as Fases</option>`;
    filtroAno.disabled = true;

    if (serie && dados[serie]) {
      Object.keys(dados[serie]).forEach(ano => {
        const opt = document.createElement("option");
        opt.value = ano;
        opt.textContent = ano;
        filtroAno.appendChild(opt);
      });
      filtroAno.disabled = false;
    }
  }

  function aplicarFiltrosComBusca() {
    const serieSelecionada = filtroSerie.value;
    const anoSelecionado = filtroAno.value;
    const textoBusca = searchInput.value.trim().toLowerCase();

    const resultado = turmasCarregadas.filter(({ dados }) => {
      const condSerie = !serieSelecionada || dados.serie === serieSelecionada;
      const condAno = !anoSelecionado || dados.ano === anoSelecionado;
      const condBusca =
        !textoBusca ||
        dados.turma.toLowerCase().includes(textoBusca) ||
        dados.ano.toLowerCase().includes(textoBusca) ||
        dados.periodo.toLowerCase().includes(textoBusca) ||
        nomesSeries[dados.serie]?.toLowerCase().includes(textoBusca);

      return condSerie && condAno && condBusca;
    });

    renderizarTurmas(resultado);
  }

  async function contarAlunosPorTurma(turmaId) {
    try {
      const alunosRef = collection(db, "empresa", empresaId, "alunos");

      const ativosQuery = query(alunosRef, where("idTurma", "==", turmaId), where("status", "==", true));
      const inativosQuery = query(alunosRef, where("idTurma", "==", turmaId), where("status", "==", false));

      const [ativosSnap, inativosSnap] = await Promise.all([getDocs(ativosQuery), getDocs(inativosQuery)]);

      return {
        ativos: ativosSnap.size,
        inativos: inativosSnap.size
      };
    } catch (e) {
      console.error("Erro ao contar alunos:", e);
      return { ativos: 0, inativos: 0 };
    }
  }

  async function carregarTurmas() {
    try {
      const turmasRef = collection(db, "empresa", empresaId, "turmas");
      const snapshot = await getDocs(turmasRef);

      turmasCarregadas = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const turma = doc.data();
          const id = doc.id;
          const contagem = await contarAlunosPorTurma(id);
          return {
            id,
            dados: turma,
            qtdAtivos: contagem.ativos,
            qtdInativos: contagem.inativos
          };
        })
      );

      aplicarFiltrosComBusca(); // mostra turmas filtradas
    } catch (e) {
      console.error("Erro ao carregar turmas:", e);
      turmasContainer.innerHTML = `<p>Erro ao carregar turmas.</p>`;
    }
  }

  function renderizarTurmas(lista) {
    turmasContainer.innerHTML = "";

    if (!lista.length) {
      turmasContainer.innerHTML = "<p>Nenhuma turma encontrada com os filtros aplicados.</p>";
      return;
    }

    lista.forEach(({ id, dados, qtdAtivos, qtdInativos }) => {
      const div = document.createElement("div");
      div.className = "card-turma";
      div.innerHTML = `
        <h3>${dados.turma}</h3>
        <p><strong>Série:</strong> ${nomesSeries[dados.serie] || dados.serie}</p>
        <p><strong>Fase:</strong> ${dados.ano}</p>
        <p><strong>Período:</strong> ${dados.periodo}</p>
        <p><strong>Alunos Ativos:</strong> ${qtdAtivos}</p>
        <p><strong>Inativos:</strong> ${qtdInativos}</p>
      `;
      
      // Adicionando o evento de clique no card de turma
      div.addEventListener("click", () => abrirModalTurma(id, dados));

      turmasContainer.appendChild(div);
    });
  }

  // Função para abrir o modal de detalhes
  async function abrirModalTurma(turmaId, turma) {
    const modal = document.getElementById("modalDetalhesTurma");
    const conteudo = document.getElementById("conteudoDetalhesTurma");

    // Buscar alunos ativos e inativos da turma
    const alunosAtivos = await buscarAlunosPorTurmaComStatus(turmaId, true);
    const alunosInativos = await buscarAlunosPorTurmaComStatus(turmaId, false);

    const listaAtivos = alunosAtivos.length > 0
      ? alunosAtivos.map(a => `<li>${a.nome}</li>`).join("")
      : "<li>Nenhum aluno ativo</li>";

    const listaInativos = alunosInativos.length > 0
      ? alunosInativos.map(a => `<li>${a.nome}</li>`).join("")
      : "<li>Nenhum aluno inativo</li>";

    conteudo.innerHTML = `
      <h2>${turma.turma}</h2>
      <p><strong>Série:</strong> ${nomesSeries[turma.serie]}</p>
      <p><strong>Fase:</strong> ${turma.ano}</p>
      <p><strong>Período:</strong> ${turma.periodo}</p>
      <hr />
      <p><strong>👩‍🎓 Alunos Ativos (${alunosAtivos.length}):</strong></p>
      <ul>${listaAtivos}</ul>
      <p><strong>🛑 Alunos Inativos (${alunosInativos.length}):</strong></p>
      <ul>${listaInativos}</ul>
    `;

    modal.style.display = "block";
    modal.setAttribute("aria-hidden", "false");
  }

  // Função para fechar o modal
  document.getElementById("fecharModalTurma").onclick = () => {
    const modal = document.getElementById("modalDetalhesTurma");
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  };

  // Fecha o modal se clicar fora dele
  window.onclick = (event) => {
    const modal = document.getElementById("modalDetalhesTurma");
    if (event.target === modal) {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
    }
  };

  // Função para buscar alunos por status
  async function buscarAlunosPorTurmaComStatus(turmaId, statusBool) {
    try {
      const alunosRef = collection(db, "empresa", empresaId, "alunos");
      const q = query(
        alunosRef,
        where("idTurma", "==", turmaId),
        where("status", "==", statusBool)
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Erro ao buscar alunos por status:", error);
      return [];
    }
  }

  // Inicializa as turmas ao carregar a página
  carregarTurmas();
});
