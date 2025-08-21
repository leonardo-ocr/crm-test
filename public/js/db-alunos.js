//db-alunos
import { db } from './firebase-config.js';
import { collection, getDocs, query, addDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { auth } from './firebase-config.js';

export function initAlunos() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const empresaId = user.uid;

      const alunosRef = collection(db, "empresa", empresaId, "aluno");
      const q = query(alunosRef);
      const querySnapshot = await getDocs(q);

      const alunos = querySnapshot.docs.map(doc => doc.data());
      renderizarAlunos(alunos);

      // Ativa o filtro de busca
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          const query = searchInput.value.trim().toLowerCase();
          const filtrados = alunos.filter(aluno =>
            aluno.nome.toLowerCase().includes(query) ||
            aluno.email.toLowerCase().includes(query) ||
            aluno.id.toLowerCase().includes(query)
          );
          renderizarAlunos(filtrados);
        });
      }

      // Modal de adicionar aluno
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

        formAdicionarAluno.addEventListener("submit", async (e) => {
          e.preventDefault();
          const nome = document.getElementById("nome").value;
          const email = document.getElementById("email").value;
          const id = document.getElementById("id").value;

          try {
            await addDoc(collection(db, "empresa", empresaId, "aluno"), {
              nome,
              email,
              id
            });

            alert(`Aluno cadastrado com sucesso:\nNome: ${nome}\nEmail: ${email}\nID: ${id}`);
            formAdicionarAluno.reset();
            modalAdicionarAluno.style.display = "none";

            // Recarrega a lista com o novo aluno
            initAlunos();
          } catch (error) {
            console.error("Erro ao cadastrar aluno:", error);
            alert("Erro ao cadastrar aluno.");
            console.log('addStudentBtn:', addStudentBtn);
            console.log('modalAdicionarAluno:', modalAdicionarAluno);
            console.log('fecharModal:', fecharModal);
            console.log('formAdicionarAluno:', formAdicionarAluno);

          }
        });
      }
    } else {
      console.warn("Usuário não autenticado.");
    }
  });
}

// Função para mostrar os alunos
function renderizarAlunos(lista) {
  const container = document.getElementById('searchResults');
  if (!container) return;

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
