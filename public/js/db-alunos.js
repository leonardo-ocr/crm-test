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
  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    const filtrados = alunos.filter(aluno =>
      aluno.nome?.toLowerCase().includes(query) ||
      aluno.emailResponsavel?.toLowerCase().includes(query) ||
      aluno.id?.toLowerCase().includes(query)
    );
    renderizarAlunos(filtrados);
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
      location.reload(); // recarrega para evitar múltiplos listeners e atualizar lista
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
    <table style="
      width: 100%;
      border-collapse: collapse;
      font-family: Arial, sans-serif;
      font-size: 14px;
      margin-top: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      overflow: hidden;
    ">
      <thead>
        <tr style="background-color: #6a4fce; color: white;">
          <th style="padding: 12px 15px; text-align: left;">Nome</th>
          <th style="padding: 12px 15px; text-align: left;">Email</th>
          <th style="padding: 12px 15px; text-align: left;">ID</th>
        </tr>
      </thead>
      <tbody>
        ${lista.map(aluno => `
          <tr style="border-bottom: 1px solid #e0e0e0; transition: background-color 0.2s;">
            <td 
              style="padding: 12px 15px; color: #6a4fce; font-weight: 600; cursor: pointer;"
              class="aluno-nome"
              data-aluno='${encodeURIComponent(JSON.stringify(aluno))}'>
              ${aluno.nome}
            </td>
            <td style="padding: 12px 15px;">${aluno.emailResponsavel || "-"}</td>
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

function mostrarDetalhesAluno(aluno) {
  const modal = document.getElementById('modalDetalhesAluno');
  if (!modal) return;

  const isAtivo = aluno.status;

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-btn" id="fecharModalDetalhes">&times;</span>
      <div class="modal-header">Detalhes do Aluno</div>
      <div class="modal-body">
        <p class="full-width"><strong>Nome:</strong> ${aluno.nome || "-"}</p>
        <p><strong>Email do responsável:</strong> ${aluno.emailResponsavel || "-"}</p>
        <p><strong>Telefone do responsável:</strong> ${aluno.telefoneResponsavel || "-"}</p>
        <p><strong>Mensalidade:</strong> R$${aluno.pagamento?.mensalidade || "-"}</p>
        <p><strong>Porcentagem da bolsa:</strong> ${aluno.pagamento?.porcentagemBolsa || "0"}%</p>
        <p><strong>Motivo da bolsa:</strong> ${aluno.pagamento?.motivoBolsa || "-"}</p>
        <p><strong>Data de nascimento:</strong> ${aluno.dataNascimento || "-"}</p>
        <p><strong>Data de matrícula:</strong> ${aluno.dataMatricula || "-"}</p>
        <p class="full-width"><strong>Status da matrícula:</strong> <span class="${isAtivo ? 'status-ativo' : 'status-inativo'}">${isAtivo ? 'Ativo' : 'Inativo'}</span></p>
        <p><strong>ID:</strong> ${aluno.id || "-"}</p>
        <p><strong>ID Turma:</strong> ${aluno.idTurma || "-"}</p>
      </div>
      <div class="modal-footer">
        <button id="alterarStatusAlunoBtn" title="${isAtivo ? 'Desativar matrícula' : 'Ativar matrícula'}">
          <i class="fas ${isAtivo ? 'fa-user-slash' : 'fa-user-check'}"></i>
          ${isAtivo ? 'Desativar Matrícula' : 'Ativar Matrícula'}
        </button>
      </div>
    </div>
  `;

  modal.style.display = 'block';

  // Fechar modal
  document.getElementById('fecharModalDetalhes').onclick = () => modal.style.display = 'none';

  window.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  };

  // Alterar status do aluno
  document.getElementById('alterarStatusAlunoBtn').onclick = async () => {
    const empresaId = "esc001";

    try {
      const alunosRef = collection(db, "empresa", empresaId, "alunos");
      const snapshot = await getDocs(alunosRef);
      const alunoDoc = snapshot.docs.find(doc => doc.data().id === aluno.id);

      if (!alunoDoc) {
        alert("Aluno não encontrado.");
        return;
      }

      const alunoDocRef = doc(db, "empresa", empresaId, "alunos", alunoDoc.id);
      const novoStatus = !aluno.status;

      await updateDoc(alunoDocRef, { status: novoStatus });

      alert(`Matrícula ${novoStatus ? 'reativada' : 'desativada'} com sucesso.`);
      modal.style.display = 'none';
      location.reload(); // Atualiza a lista
    } catch (error) {
      console.error("Erro ao atualizar status do aluno:", error);
      alert("Erro ao atualizar matrícula.");
    }
  };
}
