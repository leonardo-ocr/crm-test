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

    const userId = user.uid;
    let empresaId = null;

    try {
      // Buscar todas as empresas
      const empresasSnapshot = await getDocs(collection(db, "empresa"));

      // Procurar em qual empresa o usuário está cadastrado
      for (const empresaDoc of empresasSnapshot.docs) {
        const usuarioRef = doc(db, "empresa", empresaDoc.id, "usuario", userId);
        const usuarioSnap = await getDoc(usuarioRef);
        if (usuarioSnap.exists()) {
          empresaId = empresaDoc.id;  // Atualiza empresaId globalmente
          break;
        }
      }

      if (!empresaId) {
        console.warn("Empresa do usuário não encontrada.");
        return;
      }

      // Carregar os alunos da empresa correta
      const alunosRef = collection(db, "empresa", empresaId, "alunos");
      const alunos = await buscarAlunos(alunosRef);

      renderizarAlunos(alunos, empresaId);
      configurarBusca(alunos, empresaId);

      // Agora que a empresaId está definida, chamamos a função para configurar o modal de adicionar aluno
      configurarModalAdicionarAluno(alunosRef, empresaId);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  });
}

function configurarModalAdicionarAluno(alunosRef, empresaId) {
  const addStudentBtn = document.getElementById("addStudentBtn");
  const modalAdicionarAluno = document.getElementById("modalAdicionarAluno");
  const fecharModal = document.getElementById("fecharModal");
  const formAdicionarAluno = document.getElementById("formAdicionarAluno");

  if (!addStudentBtn || !modalAdicionarAluno || !fecharModal || !formAdicionarAluno) return;

  addStudentBtn.onclick = async () => {
    modalAdicionarAluno.style.display = "block";

    // Carregar as turmas existentes
    const turmas = await buscarTurmas(empresaId);
    const selectTurma = document.getElementById("idTurma");
    selectTurma.innerHTML = '<option value="">Selecione uma turma</option>';

    turmas.forEach(turma => {
      const option = document.createElement("option");
      option.value = turma.id;
      option.textContent = `${turma.nome} (${turma.periodo})`;
      selectTurma.appendChild(option);
    });

    // Escutar mudança no select para atualizar série e período
    selectTurma.addEventListener('change', () => {
  const turmaSelecionada = turmas.find(t => t.id === selectTurma.value);
  const inputSerie = document.getElementById("inputSerie");
  const inputPeriodo = document.getElementById("inputPeriodo");

  if (turmaSelecionada) {
    inputSerie.value = turmaSelecionada.nome;
    inputPeriodo.value = turmaSelecionada.periodo || "";
  }
  else {
        inputSerie.value = "";
        inputPeriodo.value = "";
      }
    });

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
        idTurma: document.getElementById("idTurma").value.trim(),  // Valor selecionado do <select> de turma
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
        renderizarAlunos(await buscarAlunos(alunosRef), empresaId);
      } catch (error) {
        console.error("Erro ao cadastrar aluno:", error);
        alert("Erro ao cadastrar aluno.");
      }
    };
  };
}

async function buscarAlunos(alunosRef) {
  const q = query(alunosRef);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
}

function configurarBusca(alunos, empresaId) {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const filtroStatus = document.getElementById('filtroStatus'); // <- novo

  if (!searchInput || !searchBtn || !filtroStatus) return;

  const buscar = () => {
    const query = searchInput.value.trim().toLowerCase();
    const statusSelecionado = filtroStatus.value;

    const filtrados = alunos.filter(aluno => {
      const textoCorresponde =
        aluno.nome?.toLowerCase().includes(query) ||
        aluno.emailResponsavel?.toLowerCase().includes(query) ||
        aluno.id?.toLowerCase().includes(query) ||
        aluno.serie?.toLowerCase().includes(query);

      const statusAluno = aluno.status ? 'ativo' : 'inativo';
      const statusCorresponde =
        statusSelecionado === 'todos' || statusSelecionado === statusAluno;

      return textoCorresponde && statusCorresponde;
    });

    renderizarAlunos(filtrados, empresaId);

  };

  searchInput.addEventListener('input', buscar);
  searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    buscar();
  });
  filtroStatus.addEventListener('change', buscar); // <- novo
}

async function buscarTurmas(empresaId) {
  const turmasRef = collection(db, "empresa", empresaId, "turmas");
  const snapshot = await getDocs(turmasRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    nome: doc.data().turma,  // Nome da turma
    periodo: doc.data().período // Período da turma
  }));
}

async function renderizarAlunos(lista, empresaId) {
  const container = document.getElementById('searchResults');
  if (!container) return;

  if (lista.length === 0) {
    container.innerHTML = '<p>Nenhum aluno encontrado.</p>';
    return;
  }

  try {
    // Buscar as turmas da empresa para mapear nome e período
    const turmas = await buscarTurmas(empresaId); // busca as turmas

    // Monta a tabela com série e período obtidos da turma
    const tabela = `
      <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px; margin-top: 20px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background-color: #6a4fce; color: white;">
            <th style="padding: 12px 15px; text-align: left;">Nome</th>
            <th style="padding: 12px 15px; text-align: left;">Série</th>
            <th style="padding: 12px 15px; text-align: left;">Período</th> 
            <th style="padding: 12px 15px; text-align: left;">ID</th>
            <th style="padding: 12px 15px; text-align: left;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${lista.map(aluno => {
            const turma = turmas.find(t => t.id === aluno.idTurma);
            const serie = turma?.nome || "-";
            const periodo = turma?.periodo || "-";

            return `
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td class="aluno-nome" style="padding: 12px 15px; color: #6a4fce; font-weight: 600; cursor: pointer;" data-aluno='${encodeURIComponent(JSON.stringify(aluno))}'>${aluno.nome}</td>
                <td style="padding: 12px 15px;">${serie}</td>
                <td style="padding: 12px 15px;">${periodo}</td>
                <td style="padding: 12px 15px;">${aluno.id || "-"}</td>
                <td style="padding: 12px 15px;">${aluno.status ? 'Ativo' : 'Inativo'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

    container.innerHTML = tabela;

    // Adiciona o evento de clique para abrir os detalhes
    document.querySelectorAll('.aluno-nome').forEach(nomeEl => {
      nomeEl.addEventListener('click', () => {
        const aluno = JSON.parse(decodeURIComponent(nomeEl.dataset.aluno));
        mostrarDetalhesAluno(aluno, empresaId);
      });
    });
  } catch (error) {
    console.error("Erro ao renderizar alunos:", error);
    container.innerHTML = '<p>Erro ao carregar alunos.</p>';
  }
}

async function mostrarDetalhesAluno(aluno, empresaId) {

  const modal = document.getElementById('modalDetalhesAluno');
  if (!modal) return;

  let editando = false;
  let alunoEditavel = { ...aluno }; // clone para edição

  function renderModoVisualizacao() {
    const isAtivo = alunoEditavel.status;

    modal.innerHTML = `
    <div class="modal-content">
  <span class="close-btn" id="fecharModalDetalhes">&times;</span>
  <div class="modal-header">Detalhes do Aluno</div>
  <div class="modal-body grid">
    <div class="coluna">
      <p><strong>Nome:</strong> ${alunoEditavel.nome || "-"}</p>
      <p><strong>Email do responsável:</strong> ${alunoEditavel.emailResponsavel || "-"}</p>
      <p><strong>Telefone do responsável:</strong> ${alunoEditavel.telefoneResponsavel || "-"}</p>
      <p><strong>Mensalidade:</strong> R$ ${parseFloat(alunoEditavel.pagamento?.mensalidade).toFixed(2) || "-"}</p>
      <p><strong>Porcentagem da bolsa:</strong> ${alunoEditavel.pagamento?.porcentagemBolsa || "0"}%</p>
      <p><strong>Motivo da bolsa:</strong> ${alunoEditavel.pagamento?.motivoBolsa || "-"}</p>
    </div>
    <div class="coluna">
      <p><strong>Data de nascimento:</strong> ${alunoEditavel.dataNascimento || "-"}</p>
      <p><strong>Data de matrícula:</strong> ${alunoEditavel.dataMatricula || "-"}</p>
      <p><strong>Status da matrícula:</strong> <span class="${alunoEditavel.status ? 'status-ativo' : 'status-inativo'}">${alunoEditavel.status ? 'Ativo' : 'Inativo'}</span></p>
      <p><strong>ID:</strong> ${alunoEditavel.id || "-"}</p>
      <p><strong>ID Turma:</strong> ${alunoEditavel.idTurma || "-"}</p>
    </div>
  </div>
  <div class="modal-footer">
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

    document.getElementById('btnEditar').onclick = () => {
      editando = true;
      renderModoEdicao();
    };
  }


async function renderModoEdicao() {
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
        <label>Data de matrícula:<br><input type="date" id="inputDataMatricula" value="${alunoEditavel.dataMatricula || ''}"></label>
        <label>Turma:<br>
          <select id="inputIdTurma">
            <option value="" disabled>Selecione</option>
            <!-- Turmas serão carregadas via JS -->
          </select>
        </label>
        <label>Status da matrícula:<br>
          <select id="inputStatusAluno">
            <option value="true" ${alunoEditavel.status ? 'selected' : ''}>Ativo</option>
            <option value="false" ${!alunoEditavel.status ? 'selected' : ''}>Inativo</option>
          </select>
        </label>
      </div>
      <div class="modal-footer">
        <button class="kekw" id="btnSalvar">Salvar</button>
        <button id="btnCancelar" class="kekw2">Cancelar</button>
      </div>
    </div>
  `;

  // 🟡 Carrega turmas e popula o select
  const selectTurma = document.getElementById("inputIdTurma");
  try {
    const turmas = await buscarTurmas(empresaId); // ⚠️ Essa função deve existir e retornar array de turmas

    turmas.forEach(turma => {
      const option = document.createElement("option");
      option.value = turma.id;
      option.textContent = `${turma.nome} (${turma.periodo})`;

      if (turma.id === alunoEditavel.idTurma) {
        option.selected = true;
      }

      selectTurma.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar turmas:", error);
    selectTurma.innerHTML = `<option value="">Erro ao carregar turmas</option>`;
  }

  // 🧩 Eventos do modal
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

  // 🟢 Evento salvar
  document.getElementById('btnSalvar').onclick = async () => {
    alunoEditavel.nome = document.getElementById('inputNome').value.trim();
    alunoEditavel.emailResponsavel = document.getElementById('inputEmailResponsavel').value.trim();
    alunoEditavel.telefoneResponsavel = document.getElementById('inputTelefoneResponsavel').value.trim();
    alunoEditavel.pagamento.mensalidade = document.getElementById('inputMensalidade').value.trim();
    alunoEditavel.pagamento.porcentagemBolsa = parseFloat(document.getElementById('inputPorcentagemBolsa').value.trim()) || 0;
    alunoEditavel.pagamento.motivoBolsa = document.getElementById('inputMotivoBolsa').value.trim();
    alunoEditavel.dataNascimento = document.getElementById('inputDataNascimento').value.trim();
    alunoEditavel.dataMatricula = document.getElementById('inputDataMatricula').value.trim();
    alunoEditavel.idTurma = document.getElementById('inputIdTurma').value.trim();
    alunoEditavel.status = document.getElementById('inputStatusAluno').value === 'true';

    try {
      const alunosRef = collection(db, "empresa", empresaId, "alunos");
      const snapshot = await getDocs(alunosRef);
      const alunoDoc = snapshot.docs.find(doc => doc.data().id === alunoEditavel.id);

      if (!alunoDoc) {
        alert("Aluno não encontrado.");
        return;
      }

      const alunoDocRef = doc(db, "empresa", empresaId, "alunos", alunoDoc.id);

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
        dataMatricula: alunoEditavel.dataMatricula,
        idTurma: alunoEditavel.idTurma,
        status: alunoEditavel.status
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
