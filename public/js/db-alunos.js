import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  addDoc,
  doc,
  getDoc,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { auth } from './firebase-config.js';

export function initAlunos() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.warn("Usuário não autenticado.");
      return;
    }

    const empresaId = "esc001";
    const userId = user.uid;

    try {
      const userDocRef = doc(db, "empresa", empresaId, "usuario", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        console.warn("Documento do usuário não encontrado.");
        return;
      }

      const alunosRef = collection(db, "empresa", empresaId, "alunos");
      const alunos = await buscarAlunos(alunosRef);

      renderizarAlunos(alunos);
      configurarBusca(alunos);
      configurarModalAdicionarAluno(alunosRef);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  });
}

async function buscarAlunos(alunosRef) {
  const q = query(alunosRef);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
}

function configurarBusca(alunos) {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  if (!searchInput || !searchBtn) return;

  const buscar = () => {
    const query = searchInput.value.trim().toLowerCase();
    const filtrados = alunos.filter(aluno =>
      aluno.nome?.toLowerCase().includes(query) ||
      aluno.emailResponsavel?.toLowerCase().includes(query) ||
      aluno.id?.toLowerCase().includes(query) ||
      aluno.serie?.toLowerCase().includes(query)
    );
    renderizarAlunos(filtrados);
  };

  searchInput.addEventListener('input', buscar);
  searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    buscar();
  });
}

function configurarModalAdicionarAluno(alunosRef) {
  const addStudentBtn = document.getElementById("addStudentBtn");
  const modalAdicionarAluno = document.getElementById("modalAdicionarAluno");
  const fecharModal = document.getElementById("fecharModal");
  const formAdicionarAluno = document.getElementById("formAdicionarAluno");

  if (!addStudentBtn || !modalAdicionarAluno || !fecharModal || !formAdicionarAluno) return;

  addStudentBtn.onclick = () => modalAdicionarAluno.style.display = "block";
  fecharModal.onclick = () => modalAdicionarAluno.style.display = "none";

  window.onclick = (event) => {
    if (event.target === modalAdicionarAluno) {
      modalAdicionarAluno.style.display = "none";
    }
  };

  formAdicionarAluno.onsubmit = async (e) => {
    e.preventDefault();

    const aluno = {
      nome: document.getElementById("nome").value.trim(),
      dataNascimento: document.getElementById("dataNascimento").value.trim(),
      dataMatricula: document.getElementById("dataMatricula").value.trim(),
      serie: document.getElementById("serie").value.trim(),
      periodo: document.getElementById("periodo").value.trim(), 
      idTurma: document.getElementById("idTurma").value.trim(),
      nomeResponsavel: document.getElementById("nomeResponsavel").value.trim(),
      emailResponsavel: document.getElementById("emailResponsavel").value.trim(),
      telefoneResponsavel: document.getElementById("telefoneResponsavel").value.trim(),
      id: crypto.randomUUID().slice(0, 8),
      status: true,
      pagamento: {
        mensalidade: document.getElementById("mensalidade").value.trim(),
        motivoBolsa: document.getElementById("motivoBolsa").value.trim(),
        porcentagemBolsa: document.getElementById("porcentagemBolsa").value.trim()
      }
    };

    try {
      await addDoc(alunosRef, aluno);
      alert("Aluno cadastrado com sucesso!");
      formAdicionarAluno.reset();
      modalAdicionarAluno.style.display = "none";
      location.reload();
    } catch (error) {
      console.error("Erro ao cadastrar aluno:", error);
      alert("Erro ao cadastrar aluno.");
    }
  };
}

function renderizarAlunos(lista) {
  const container = document.getElementById('searchResults');
  if (!container) return;

  if (lista.length === 0) {
    container.innerHTML = '<p>Nenhum aluno encontrado.</p>';
    return;
  }

  const tabela = `
    <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px; margin-top: 20px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); border-radius: 8px; overflow: hidden;">
      <thead>
        <tr style="background-color: #6a4fce; color: white;">
          <th style="padding: 12px 15px; text-align: left;">Nome</th>
          <th style="padding: 12px 15px; text-align: left;">Série</th>
          <th style="padding: 12px 15px; text-align: left;">Período</th> <!-- NOVO -->
          <th style="padding: 12px 15px; text-align: left;">ID</th>
        </tr>
      </thead>
      <tbody>
        ${lista.map(aluno => `
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td class="aluno-nome" style="padding: 12px 15px; color: #6a4fce; font-weight: 600; cursor: pointer;" data-aluno='${encodeURIComponent(JSON.stringify(aluno))}'>${aluno.nome}</td>
            <td style="padding: 12px 15px;">${aluno.serie || "-"}</td>
            <td style="padding: 12px 15px;">${aluno.periodo || "-"}</td> <!-- NOVO -->
            <td style="padding: 12px 15px;">${aluno.id || "-"}</td>       
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = tabela;

  document.querySelectorAll('.aluno-nome').forEach(nomeEl => {
    nomeEl.addEventListener('click', () => {
      const aluno = JSON.parse(decodeURIComponent(nomeEl.dataset.aluno));
      mostrarDetalhesAluno(aluno);
    });
  });
}

async function mostrarDetalhesAluno(aluno) {
  const modal = document.getElementById('modalDetalhesAluno');
  if (!modal) return;

  const empresaId = "esc001";
  let editando = false;
  let alunoEditavel = { ...aluno }; // clone para edição

  function renderModoVisualizacao() {
    const isAtivo = alunoEditavel.status;

    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-btn" id="fecharModalDetalhes">&times;</span>
        <div class="modal-header">Detalhes do Aluno</div>
        <div class="modal-body">
          <p><strong>Nome:</strong> <span id="campoNome">${alunoEditavel.nome || "-"}</span></p>
          <p><strong>Email do responsável:</strong> <span id="campoEmailResponsavel">${alunoEditavel.emailResponsavel || "-"}</span></p>
          <p><strong>Telefone do responsável:</strong> <span id="campoTelefoneResponsavel">${alunoEditavel.telefoneResponsavel || "-"}</span></p>
          <p><strong>Mensalidade:</strong> R$<span id="campoMensalidade">${alunoEditavel.pagamento?.mensalidade || "-"}</span></p>
          <p><strong>Porcentagem da bolsa:</strong> <span id="campoPorcentagemBolsa">${alunoEditavel.pagamento?.porcentagemBolsa || "0"}</span>%</p>
          <p><strong>Motivo da bolsa:</strong> <span id="campoMotivoBolsa">${alunoEditavel.pagamento?.motivoBolsa || "-"}</span></p>
          <p><strong>Data de nascimento:</strong> <span id="campoDataNascimento">${alunoEditavel.dataNascimento || "-"}</span></p>
          <p><strong>Série:</strong> <span id="campoSerie">${alunoEditavel.serie || "-"}</span></p>
          <p><strong>Período:</strong> <span id="campoPeriodo">${alunoEditavel.periodo || "-"}</span></p>
          <p><strong>Data de matrícula:</strong> <span id="campoDataMatricula">${alunoEditavel.dataMatricula || "-"}</span></p>
          <p><strong>Status da matrícula:</strong> <span class="${isAtivo ? 'status-ativo' : 'status-inativo'}">${isAtivo ? 'Ativo' : 'Inativo'}</span></p>
          <p><strong>ID:</strong> ${alunoEditavel.id || "-"}</p>
          <p><strong>ID Turma:</strong> <span id="campoIdTurma">${alunoEditavel.idTurma || "-"}</span></p>
        </div>
        <div class="modal-footer">
          <button id="btnAlterarStatus" title="${isAtivo ? 'Desativar matrícula' : 'Ativar matrícula'}">
            <i class="fas ${isAtivo ? 'fa-user-slash' : 'fa-user-check'}"></i>
            ${isAtivo ? 'Desativar Matrícula' : 'Ativar Matrícula'}
          </button>
          <button id="btnEditar">Editar</button>
        </div>
      </div>
    `;

    document.getElementById('fecharModalDetalhes').onclick = () => modal.style.display = 'none';

    window.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    };

    document.getElementById('btnAlterarStatus').onclick = async () => {
      try {
        const alunosRef = collection(db, "empresa", empresaId, "alunos");
        const snapshot = await getDocs(alunosRef);
        const alunoDoc = snapshot.docs.find(doc => doc.data().id === alunoEditavel.id);

        if (!alunoDoc) {
          alert("Aluno não encontrado.");
          return;
        }

        const alunoDocRef = doc(db, "empresa", empresaId, "alunos", alunoDoc.id);
        const novoStatus = !alunoEditavel.status;

        await updateDoc(alunoDocRef, { status: novoStatus });

        alert(`Matrícula ${novoStatus ? 'reativada' : 'desativada'} com sucesso.`);
        modal.style.display = 'none';
        location.reload();
      } catch (error) {
        console.error("Erro ao atualizar status do aluno:", error);
        alert("Erro ao atualizar matrícula.");
      }
    };

    document.getElementById('btnEditar').onclick = () => {
      editando = true;
      renderModoEdicao();
    };
  }

  function renderModoEdicao() {
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-btn" id="fecharModalDetalhes">&times;</span>
      <div class="modal-header">Editar Aluno</div>
      <div class="modal-body">
        <label>Nome:<br><input type="text" id="inputNome" value="${alunoEditavel.nome || ''}"></label>
        <label>Email do responsável:<br><input type="email" id="inputEmailResponsavel" value="${alunoEditavel.emailResponsavel || ''}"></label>
        <label>Telefone do responsável:<br><input type="tel" id="inputTelefoneResponsavel" value="${alunoEditavel.telefoneResponsavel || ''}"></label>
        <label>Mensalidade:<br><input type="text" id="inputMensalidade" value="${alunoEditavel.pagamento?.mensalidade || ''}"></label>
        <label>Porcentagem da bolsa:<br><input type="number" id="inputPorcentagemBolsa" min="0" max="100" value="${alunoEditavel.pagamento?.porcentagemBolsa || 0}"></label>
        <label>Motivo da bolsa:<br><input type="text" id="inputMotivoBolsa" value="${alunoEditavel.pagamento?.motivoBolsa || ''}"></label>
        <label>Data de nascimento:<br><input type="date" id="inputDataNascimento" value="${alunoEditavel.dataNascimento || ''}"></label>
        <label>Série:<br><input type="text" id="inputSerie" value="${alunoEditavel.serie || ''}"></label>
        <label>Período:<br>
          <select id="inputPeriodo">
            <option value="" disabled ${!alunoEditavel.periodo ? "selected" : ""}>Selecione</option>
            <option value="Manhã" ${alunoEditavel.periodo === "Manhã" ? "selected" : ""}>Manhã</option>
            <option value="Tarde" ${alunoEditavel.periodo === "Tarde" ? "selected" : ""}>Tarde</option>
            <option value="Noite" ${alunoEditavel.periodo === "Noite" ? "selected" : ""}>Noite</option>
            <option value="Integral" ${alunoEditavel.periodo === "Integral" ? "selected" : ""}>Integral</option>
          </select>
        </label>
        <label>Data de matrícula:<br><input type="date" id="inputDataMatricula" value="${alunoEditavel.dataMatricula || ''}"></label>
        <label>ID Turma:<br><input type="text" id="inputIdTurma" value="${alunoEditavel.idTurma || ''}"></label>
      </div>
      <div class="modal-footer">
        <button id="btnSalvar">Salvar</button>
        <button id="btnCancelar">Cancelar</button>
      </div>
    </div>
  `;

  document.getElementById('fecharModalDetalhes').onclick = () => modal.style.display = 'none';

  window.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  };

  document.getElementById('btnCancelar').onclick = () => {
    editando = false;
    renderModoVisualizacao();
  };

  document.getElementById('btnSalvar').onclick = async () => {
    // Pega os valores dos inputs
    alunoEditavel.nome = document.getElementById('inputNome').value.trim();
    alunoEditavel.emailResponsavel = document.getElementById('inputEmailResponsavel').value.trim();
    alunoEditavel.telefoneResponsavel = document.getElementById('inputTelefoneResponsavel').value.trim();
    alunoEditavel.pagamento.mensalidade = document.getElementById('inputMensalidade').value.trim();
    alunoEditavel.pagamento.porcentagemBolsa = document.getElementById('inputPorcentagemBolsa').value.trim();
    alunoEditavel.pagamento.motivoBolsa = document.getElementById('inputMotivoBolsa').value.trim();
    alunoEditavel.dataNascimento = document.getElementById('inputDataNascimento').value.trim();
    alunoEditavel.serie = document.getElementById('inputSerie').value.trim();
    alunoEditavel.periodo = document.getElementById('inputPeriodo').value.trim();
    alunoEditavel.dataMatricula = document.getElementById('inputDataMatricula').value.trim();
    alunoEditavel.idTurma = document.getElementById('inputIdTurma').value.trim();

    try {
      // Busca o documento para pegar o id correto do Firestore
      const alunosRef = collection(db, "empresa", empresaId, "alunos");
      const snapshot = await getDocs(alunosRef);
      const alunoDoc = snapshot.docs.find(doc => doc.data().id === alunoEditavel.id);

      if (!alunoDoc) {
        alert("Aluno não encontrado.");
        return;
      }

      const alunoDocRef = doc(db, "empresa", empresaId, "alunos", alunoDoc.id);

      // Atualiza os campos (sem modificar o id e status)
      await updateDoc(alunoDocRef, {
        nome: alunoEditavel.nome,
        emailResponsavel: alunoEditavel.emailResponsavel,
        telefoneResponsavel: alunoEditavel.telefoneResponsavel,
        pagamento: {
          mensalidade: alunoEditavel.pagamento.mensalidade,
          porcentagemBolsa: alunoEditavel.pagamento.porcentagemBolsa,
          motivoBolsa: alunoEditavel.pagamento.motivoBolsa
        },
        dataNascimento: alunoEditavel.dataNascimento,
        serie: alunoEditavel.serie,
        periodo: alunoEditavel.periodo,
        dataMatricula: alunoEditavel.dataMatricula,
        idTurma: alunoEditavel.idTurma
      });

      alert("Dados atualizados com sucesso!");
      editando = false;
      modal.style.display = 'none';
      location.reload();
    } catch (error) {
      console.error("Erro ao atualizar aluno:", error);
      alert("Erro ao atualizar dados do aluno.");
    }
  };
}


  // Inicializa o modal no modo visualização
  renderModoVisualizacao();
  modal.style.display = 'block';
}
