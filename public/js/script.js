function atualizarHorarioData() {
  const agora = new Date();

  const horas = agora.getHours().toString().padStart(2, '0');
  const minutos = agora.getMinutes().toString().padStart(2, '0');
  const segundos = agora.getSeconds().toString().padStart(2, '0');

  const dia = agora.getDate().toString().padStart(2, '0');
  const mes = (agora.getMonth() + 1).toString().padStart(2, '0');
  const ano = agora.getFullYear();

  document.getElementById('relogio').textContent = `${horas}:${minutos}:${segundos}`;
  document.getElementById('data').textContent = `${dia}/${mes}/${ano}`;
}

setInterval(atualizarHorarioData, 1000);
atualizarHorarioData();

const profileToggle = document.getElementById('profile-toggle');
const dropdownMenu = document.getElementById('dropdown-menu');

profileToggle.addEventListener('click', () => {
  dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', (e) => {
  if (!profileToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
    dropdownMenu.style.display = 'none';
  }
});

// Mock de alunos (simulando banco de dados)
const alunosMock = [
  { nome: "Lucas Silva", email: "lucas@email.com", id: "A001" },
  { nome: "Ana Souza", email: "ana@email.com", id: "A002" },
  { nome: "Carlos Lima", email: "carlos@email.com", id: "A003" },
  { nome: "João Oliveira", email: "joao@email.com", id: "A004" },
  { nome: "Fernanda Rocha", email: "fernanda@email.com", id: "A005" },
];

function renderizarAlunos(lista) {
  const container = document.getElementById('searchResults');
  if (!container) return; // Se não existir no dashboard, evita erro
  if (lista.length === 0) {
    container.innerHTML = '<p>Nenhum aluno encontrado.</p>';
    return;
  }

  const tabela = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color: #eee;">
          <th style="text-align: left; padding: 10px;">Nome</th>
          <th style="text-align: left; padding: 10px;">Email</th>
          <th style="text-align: left; padding: 10px;">ID</th>
        </tr>
      </thead>
      <tbody>
        ${lista.map(aluno => `
          <tr style="border-bottom: 1px solid #ccc;">
            <td style="padding: 8px;">${aluno.nome}</td>
            <td style="padding: 8px;">${aluno.email}</td>
            <td style="padding: 8px;">${aluno.id}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = tabela;
}

// Renderiza alunos se o container existir
renderizarAlunos(alunosMock);

// Filtragem em tempo real se input existir
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    const filtrados = alunosMock.filter(aluno =>
      aluno.nome.toLowerCase().includes(query) ||
      aluno.email.toLowerCase().includes(query) ||
      aluno.id.toLowerCase().includes(query)
    );
    renderizarAlunos(filtrados);
  });
}

// Modal cadastro de aluno
const addStudentBtn = document.getElementById("addStudentBtn");
const modalAdicionarAluno = document.getElementById("modalAdicionarAluno");
const fecharModal = document.getElementById("fecharModal");
const formAdicionarAluno = document.getElementById("formAdicionarAluno");

if (addStudentBtn && modalAdicionarAluno && fecharModal && formAdicionarAluno) {
  addStudentBtn.addEventListener("click", () => {
    modalAdicionarAluno.style.display = "block";
  });

  fecharModal.addEventListener("click", () => {
    modalAdicionarAluno.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modalAdicionarAluno) {
      modalAdicionarAluno.style.display = "none";
    }
  });

  formAdicionarAluno.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const id = document.getElementById("id").value;

    alert(`Aluno cadastrado com sucesso:\nNome: ${nome}\nEmail: ${email}\nID: ${id}`);

    formAdicionarAluno.reset();
    modalAdicionarAluno.style.display = "none";
  });
}

// Ativa o link correto na sidebar com base na URL atual
document.addEventListener("DOMContentLoaded", () => {
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
});

// Variáveis dos elementos
const btnAdd = document.getElementById('btnAdd');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const formMov = document.getElementById('formMov');
const tabelaBody = document.getElementById('tabela-body');
const ctx = document.getElementById('graficoFinanceiro').getContext('2d');

// Objeto para armazenar os dados financeiros
let dadosFinanceiros = {};

// Ação do botão "Adicionar Movimentação"
btnAdd.onclick = () => {
  modal.style.display = 'block'; // Exibe o modal para inserir dados
};

// Fechar o modal quando clicar fora ou no "X"
closeModal.onclick = () => modal.style.display = 'none';
window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };

// Evento de submit do formulário
formMov.addEventListener('submit', (e) => {
  e.preventDefault();

  const mes = formMov.mes.value.trim();
  const tipo = formMov.tipo.value;
  const valor = parseFloat(formMov.valor.value);

  // Verifica se já existe um mês no objeto e se não, cria
  if (!dadosFinanceiros[mes]) {
    dadosFinanceiros[mes] = { entrada: 0, saida: 0 };
  }

  // Adiciona os valores conforme o tipo (entrada ou saída)
  if (tipo === 'entrada') {
    dadosFinanceiros[mes].entrada += valor;
  } else {
    dadosFinanceiros[mes].saida += valor;
  }

  // Atualiza a tabela e o gráfico com os novos dados
  atualizarTabela();
  atualizarGrafico();

  // Fecha o modal e reseta o formulário
  modal.style.display = 'none';
  formMov.reset();
});

// Função para atualizar a tabela
function atualizarTabela() {
  tabelaBody.innerHTML = ''; // Limpa a tabela antes de adicionar os novos dados

  // Ordena os meses para exibição
  const mesesOrdenados = Object.keys(dadosFinanceiros).sort((a, b) => new Date('01 ' + a) - new Date('01 ' + b));

  mesesOrdenados.forEach(mes => {
    const entrada = dadosFinanceiros[mes].entrada || 0;
    const saida = dadosFinanceiros[mes].saida || 0;
    const lucro = entrada - saida;

    // Cria a linha da tabela com os dados do mês
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${mes}</td>
      <td>R$ ${entrada.toFixed(2)}</td>
      <td>-R$ ${saida.toFixed(2)}</td>
      <td style="color: ${lucro >= 0 ? 'green' : 'red'};">R$ ${lucro.toFixed(2)}</td>
    `;
    tabelaBody.appendChild(tr);
  });
}

// Variável do gráfico
let grafico;

// Função para atualizar o gráfico
function atualizarGrafico() {
  // Coleta os dados dos meses e lucros
  const meses = Object.keys(dadosFinanceiros);
  const lucros = meses.map(mes => dadosFinanceiros[mes].entrada - dadosFinanceiros[mes].saida);

  // Se o gráfico já existe, destrói o anterior antes de criar o novo
  if (grafico) {
    grafico.destroy();
  }

  // Cria o novo gráfico com os dados atualizados
  grafico = new Chart(ctx, {
    type: 'bar', // Tipo de gráfico: barra
    data: {
      labels: meses, // Rótulos do gráfico (meses)
      datasets: [{
        label: 'Lucro (R$)',
        data: lucros, // Dados de lucro
        backgroundColor: 'rgba(0, 123, 255, 0.6)', // Cor das barras
        borderRadius: 4 // Bordas arredondadas
      }]
    },
    options: {
      responsive: true, // Responsivo para diferentes telas
      scales: {
        y: { beginAtZero: true } // Garante que o eixo Y começa do zero
      }
    }
  });
}

