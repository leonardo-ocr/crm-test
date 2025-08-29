document.addEventListener("DOMContentLoaded", function () {
  // ⏰ Relógio
  const atualizarHorarioData = () => {
    const agora = new Date();
    const horas = agora.getHours().toString().padStart(2, '0');
    const minutos = agora.getMinutes().toString().padStart(2, '0');
    const segundos = agora.getSeconds().toString().padStart(2, '0');
    const dia = agora.getDate().toString().padStart(2, '0');
    const mes = (agora.getMonth() + 1).toString().padStart(2, '0');
    const ano = agora.getFullYear();

    document.getElementById('relogio').textContent = `${horas}:${minutos}:${segundos}`;
    document.getElementById('data').textContent = `${dia}/${mes}/${ano}`;
  };

  setInterval(atualizarHorarioData, 1000);
  atualizarHorarioData();

  // 👤 Dropdown do perfil
  const profileToggle = document.getElementById('profile-toggle');
  const dropdownMenu = document.getElementById('dropdown-menu');

  if (profileToggle && dropdownMenu) {
    profileToggle.addEventListener('click', () => {
      dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
      if (!profileToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.style.display = 'none';
      }
    });
  }

  // 📚 Dropdown das séries
  const toggleBtn = document.querySelector(".dropdown-toggle-btn");
  const dropdownList = document.getElementById("seriesDropdown");

  if (toggleBtn && dropdownList) {
    toggleBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdownList.style.display =
        dropdownList.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", function () {
      dropdownList.style.display = "none";
    });

    document.querySelectorAll("#seriesDropdown li").forEach((item) => {
      item.addEventListener("click", function () {
        console.log("Você clicou em:", item.textContent);
        dropdownList.style.display = "none";
      });
    });
  }
 
  // 📌 Ativar link na sidebar
  const links = document.querySelectorAll(".sidebar nav a");
  const path = window.location.pathname.split("/").pop();

  links.forEach(link => {
    link.classList.remove("active");
    if ((path === "" || path === "dashboard.html") && link.getAttribute("href") === "dashboard.html") {
      link.classList.add("active");
    } else if (link.getAttribute("href") === path) {
      link.classList.add("active");
    }
  });

  // 💸 Financeiro
  const btnAdd = document.getElementById('btnAdd');
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');
  const formMov = document.getElementById('formMov');
  const tabelaBody = document.getElementById('tabela-body');
  const ctx = document.getElementById('graficoFinanceiro')?.getContext('2d');

  let dadosFinanceiros = {};
  let grafico;

  if (btnAdd && modal && closeModal && formMov && tabelaBody && ctx) {
    btnAdd.onclick = () => modal.style.display = 'block';
    closeModal.onclick = () => modal.style.display = 'none';
    window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };

    formMov.addEventListener('submit', (e) => {
      e.preventDefault();

      const mes = formMov.mes.value.trim();
      const tipo = formMov.tipo.value;
      const valor = parseFloat(formMov.valor.value);

      if (!dadosFinanceiros[mes]) {
        dadosFinanceiros[mes] = { entrada: 0, saida: 0 };
      }

      if (tipo === 'entrada') {
        dadosFinanceiros[mes].entrada += valor;
      } else {
        dadosFinanceiros[mes].saida += valor;
      }

      atualizarTabela();
      atualizarGrafico();
      modal.style.display = 'none';
      formMov.reset();
    });

    const atualizarTabela = () => {
      tabelaBody.innerHTML = '';
      const mesesOrdenados = Object.keys(dadosFinanceiros).sort((a, b) => new Date('01 ' + a) - new Date('01 ' + b));

      mesesOrdenados.forEach(mes => {
        const entrada = dadosFinanceiros[mes].entrada || 0;
        const saida = dadosFinanceiros[mes].saida || 0;
        const lucro = entrada - saida;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${mes}</td>
          <td>R$ ${entrada.toFixed(2)}</td>
          <td>-R$ ${saida.toFixed(2)}</td>
          <td style="color: ${lucro >= 0 ? 'green' : 'red'};">R$ ${lucro.toFixed(2)}</td>
        `;
        tabelaBody.appendChild(tr);
      });
    };

    const atualizarGrafico = () => {
      const meses = Object.keys(dadosFinanceiros);
      const lucros = meses.map(mes => dadosFinanceiros[mes].entrada - dadosFinanceiros[mes].saida);

      if (grafico) grafico.destroy();

      grafico = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: meses,
          datasets: [{
            label: 'Lucro (R$)',
            data: lucros,
            backgroundColor: 'rgba(0, 123, 255, 0.6)',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    };
  }


// Filtros de série, ano e turma
const filtroSerie = document.getElementById("filtroSerie");
const filtroAno = document.getElementById("filtroAno");
const filtroTurma = document.getElementById("filtroTurma");

// Dados simulados
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

// Ao mudar a série
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

// Ao mudar o ano
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

// Ao selecionar a turma
filtroTurma.addEventListener("change", function () {
  const serie = filtroSerie.value;
  const ano = filtroAno.value;
  const turma = filtroTurma.value;

  if (turma) {
    console.log(`Selecionado: ${serie} > ${ano} > ${turma}`);
    // Aqui você pode filtrar as turmas na tela, por exemplo:
    // filtrarTurmas(serie, ano, turma);
  }
});

// Abrir modal
const addClassBtn = document.getElementById('addClassBtn');
const modalNovaTurma = document.getElementById('modalNovaTurma');
const formNovaTurma = document.getElementById('formNovaTurma');

addClassBtn.addEventListener('click', () => {
  modalNovaTurma.style.display = 'flex';
});

// Fechar modal ao clicar no X
fecharModal.addEventListener('click', () => {
  modalNovaTurma.style.display = 'none';
});

// Fechar modal ao clicar fora do conteúdo
window.addEventListener('click', (e) => {
  if (e.target === modalNovaTurma) {
    modalNovaTurma.style.display = 'none';
  }
});

// Capturar dados do formulário
formNovaTurma.addEventListener('submit', (e) => {
  e.preventDefault();

  const nome = document.getElementById("nomeTurma").value.trim();
  const serie = document.getElementById("serieTurma").value;
  const ano = document.getElementById("anoEscolar").value;

  const turma = {
    nome,
    serie,
    ano
  };

  console.log("Nova turma cadastrada:", turma);

  // 👉 Aqui você poderá adicionar o push para o Firebase futuramente
  // Exemplo com Firebase (comentado):
  // firebase.database().ref('turmas').push(turma);

  // Feedback e reset
  alert(`Turma "${turma.nome}" adicionada com sucesso!`);
  formNovaTurma.reset();
  modalNovaTurma.style.display = 'none';})})
