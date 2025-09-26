document.addEventListener('DOMContentLoaded', () => {
  const limites = {
    nome: 100,
    email: 100,
    cpf: 14,
    rg: 20,
    estadoCivil: 20,
    dependentes: 2,
    cargo: 50,
    departamento: 50,
    jornadaTrabalho: 30,
    tipoContrato: 20,
    dataNascimento: 10,
    dataAdmissao: 10,
    salario: 15,
    telefone: 15,
    banco: 30,
    agencia: 10,
    conta: 20,
    carteiraTrabalho: 30,
    pisPasep: 20,
    tituloEleitor: 20,
    rua: 100,
    numero: 10,
    bairro: 50,
    cep: 9,
    cidade: 50,
    estado: 2,
    idResponsavel: 50
  };

  function limitarInput(input, maxLength) {
    if (input.value.length > maxLength) {
      input.value = input.value.slice(0, maxLength);
    }
  }

  function validarRg(rg) {
    return rg.replace(/[^a-zA-Z0-9]/g, '');
  }

  function validarTelefone(tel) {
    return tel.replace(/[^0-9()\-\s]/g, '');
  }

  function validarNumeros(valor) {
    return valor.replace(/\D/g, '');
  }

  Object.keys(limites).forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;

    input.addEventListener('input', () => {
      const valor = input.value.trim();

      if (valor !== '') {
        if (id === 'rg') {
          input.value = validarRg(valor);
        } else if (id === 'telefone') {
          input.value = validarTelefone(valor);
        } else if (['dependentes', 'salario', 'agencia', 'conta'].includes(id)) {
          if (id === 'salario') {
            input.value = valor.replace(/[^0-9.]/g, '');
            const partes = input.value.split('.');
            if (partes.length > 2) {
              input.value = partes[0] + '.' + partes.slice(1).join('');
            }
          } else {
            input.value = validarNumeros(valor);
          }
        }
      }

      limitarInput(input, limites[id]);
    });
  });

  const cpfInput = document.getElementById('cpf');
  if (cpfInput) {
    cpfInput.addEventListener('input', () => {
      let cpf = cpfInput.value.replace(/\D/g, '');

      if (cpf === '') return;
      if (cpf.length > 11) cpf = cpf.slice(0, 11);

      cpfInput.value = cpf
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    });
  }

  const cepInput = document.getElementById('cep');
  const ruaInput = document.getElementById('rua');
  const bairroInput = document.getElementById('bairro');
  const cidadeInput = document.getElementById('cidade');
  const estadoInput = document.getElementById('estado');

  if (cepInput) {
    cepInput.addEventListener('input', () => {
      let cep = cepInput.value.replace(/\D/g, '');
      if (cep.length > 8) cep = cep.slice(0, 8);
      cepInput.value = cep.replace(/(\d{5})(\d)/, '$1-$2');
    });

    cepInput.addEventListener('blur', () => {
      const cep = cepInput.value.replace(/\D/g, '');
      if (cep.length !== 8) return;

      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            if (ruaInput) ruaInput.value = data.logradouro || '';
            if (bairroInput) bairroInput.value = data.bairro || '';
            if (cidadeInput) cidadeInput.value = data.localidade || '';
            if (estadoInput) estadoInput.value = data.uf || '';
          } else {
            alert('CEP não encontrado.');
          }
        })
        .catch(() => alert('Erro ao buscar o CEP.'));
    });
  }
});

// form-aluno-validacao.js

document.addEventListener('DOMContentLoaded', () => {
  const limites = {
    nome: 100,
    emailResponsavel: 100,
    telefoneResponsavel: 15,
    mensalidade: 15,
    motivoBolsa: 100,
    porcentagemBolsa: 3,
    dataNascimento: 10,
    dataMatricula: 10,
    serie: 20,
    periodo: 20,
    idTurma: 20
  };

  function limitarInput(input, maxLength) {
    if (input.value.length > maxLength) {
      input.value = input.value.slice(0, maxLength);
    }
  }

  function somenteNumeros(valor) {
    return valor.replace(/\D/g, '');
  }

  function formatarTelefone(tel) {
    tel = tel.replace(/\D/g, '');
    tel = tel.slice(0, 11);
    if (tel.length <= 10) {
      return tel.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      return tel.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
  }

  Object.keys(limites).forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;

    input.addEventListener('input', () => {
      let valor = input.value.trim();

      if (id === 'telefoneResponsavel') {
        input.value = formatarTelefone(valor);
      } else if (id === 'mensalidade' || id === 'porcentagemBolsa') {
        input.value = valor.replace(/[^0-9.]/g, '');
        const partes = input.value.split('.');
        if (partes.length > 2) {
          input.value = partes[0] + '.' + partes.slice(1).join('');
        }
      }

      limitarInput(input, limites[id]);
    });
  });
});





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

      const [ativosSnap, inativosSnap] = await Promise.all([
        getDocs(ativosQuery),
        getDocs(inativosQuery)
      ]);

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
      turmasContainer.appendChild(div);
    });
  }
});

  // modificar abrirModalTurma se quiser mostrar em detalhe também
  async function abrirModalTurma(turmaId, turma) {
  const modal = document.getElementById("modalDetalhesTurma");
  const conteudo = document.getElementById("conteudoDetalhesTurma");

  // Carregar professores e marcar o atual
  await carregarProfessores(turma.idProfessor || "");

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

  // Evento para atualizar professor da turma quando mudar no select
  const selectProf = document.getElementById("professorTurma");
  if (selectProf) {
    // Remover listeners anteriores (segurança)
    selectProf.onchange = null;

    selectProf.onchange = async () => {
      const novoProfessorId = selectProf.value;

      if (!novoProfessorId) {
        alert("Selecione um professor válido.");
        return;
      }

      try {
        const turmaDocRef = doc(db, "empresa", empresaId, "turmas", turmaId);
        await updateDoc(turmaDocRef, { idProfessor: novoProfessorId });
        alert("Professor atualizado com sucesso!");
      } catch (error) {
        console.error("Erro ao atualizar professor:", error);
        alert("Erro ao atualizar professor.");
      }
    };
  }
}


  // Busca alunos por turma e status específico
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

  if (addClassBtn && modalNovaTurma) {
    addClassBtn.addEventListener("click", () => {
      modalNovaTurma.style.display = "block";
      modalNovaTurma.setAttribute("aria-hidden", "false");
    });
  }

  document.getElementById("fecharModal").onclick = () => {
    modalNovaTurma.style.display = "none";
    modalNovaTurma.setAttribute("aria-hidden", "true");
    addClassBtn.focus();
  };

  window.addEventListener("click", (event) => {
    if (event.target === modalNovaTurma) {
      modalNovaTurma.style.display = "none";
      modalNovaTurma.setAttribute("aria-hidden", "true");
      addClassBtn.focus();
    }
  });

  serieTurmaSelect.addEventListener("change", atualizarAnoTurmaModal);

  formNovaTurma.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nomeTurma = nomeTurmaInput.value.trim();
    const serieTurma = serieTurmaSelect.value;
    const periodoTurma = periodoTurmaSelect.value;
    const anoTurma = anoTurmaSelect.value;

    if (!nomeTurma || !serieTurma || !periodoTurma || !anoTurma) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      await addDoc(collection(db, "empresa", empresaId, "turmas"), {
        turma: nomeTurma,
        serie: serieTurma,
        periodo: periodoTurma,
        ano: anoTurma
      });

      alert("Turma adicionada com sucesso!");
      modalNovaTurma.style.display = "none";
      formNovaTurma.reset();
      anoTurmaSelect.disabled = true;

      carregarTurmas();
    } catch (error) {
      console.error("Erro ao adicionar turma:", error);
      alert("Erro ao adicionar turma!");
    }
  });

  // Inicializa
  carregarTurmas();
;
