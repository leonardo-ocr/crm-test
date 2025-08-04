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

