import { db, auth } from './firebase-config.js';
import {
  collection, getDocs, query, addDoc, doc, updateDoc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

export function initFuncionarios() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.warn('Usuário não autenticado');
      return;
    }

    const empresaId = 'esc001'; // Ajuste conforme sua estrutura Firestore
    const funcionariosRef = collection(db, 'empresa', empresaId, 'funcionarios');

    try {
      const funcionarios = await buscarFuncionarios(funcionariosRef);
      renderizarFuncionarios(funcionarios);
      configurarBusca(funcionarios);
      configurarModalAdicionarFuncionario(funcionariosRef);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    }
  });
}

async function buscarFuncionarios(ref) {
  const q = query(ref);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ idDoc: doc.id, ...doc.data() }));
}

function configurarBusca(funcionarios) {
  const input = document.getElementById('searchInput');
  const btn = document.getElementById('searchBtn');

  if (!input || !btn) return;

  function buscar() {
    const termo = input.value.trim().toLowerCase();
    const filtrados = funcionarios.filter(f =>
      (f.nome?.toLowerCase().includes(termo)) ||
      (f.email?.toLowerCase().includes(termo)) ||
      (f.id?.toLowerCase().includes(termo))
    );
    renderizarFuncionarios(filtrados);
  }

  input.addEventListener('input', buscar);
  btn.addEventListener('click', e => {
    e.preventDefault();
    buscar();
  });
}

function configurarModalAdicionarFuncionario(ref) {
  const btnAbrir = document.getElementById('addFuncionarioBtn');
  const modal = document.getElementById('modalAdicionarFuncionario');
  const fechar = document.getElementById('fecharModalFuncionario');
  const form = document.getElementById('formAdicionarFuncionario');

  if (!btnAbrir || !modal || !fechar || !form) return;

  btnAbrir.onclick = () => modal.style.display = 'block';

  fechar.onclick = () => modal.style.display = 'none';

  window.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
  };

  form.onsubmit = async (e) => {
    e.preventDefault();

    const novoFuncionario = {
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
      id: form.id.value.trim(),
      ativo: true,
      cargo: '/empresa/esc001/cargo/dono', // Exemplo fixo, ajuste se quiser
      cpf: form.cpf.value.trim(),
      dataAdmissao: new Date(),
      salario: parseFloat(form.salario.value) || 0,
      endereco: {
        rua: form.rua.value.trim(),
        numero: form.numero.value.trim(),
        bairro: form.bairro.value.trim(),
        cep: form.cep.value.trim(),
        cidade: form.cidade.value.trim(),
        estado: form.estado.value.trim()
      },
      idResponsavel: form.idResponsavel.value.trim(),
      telefone: form.telefone.value.trim()
    };

    try {
      await addDoc(ref, novoFuncionario);
      alert('Funcionário adicionado com sucesso!');
      form.reset();
      modal.style.display = 'none';
      location.reload(); // Ou você pode atualizar só a lista pra ficar mais suave
    } catch (err) {
      console.error('Erro ao adicionar funcionário:', err);
      alert('Erro ao adicionar funcionário.');
    }
  };
}

function renderizarFuncionarios(lista) {
  const container = document.getElementById('searchResults');
  if (!container) return;

  if (lista.length === 0) {
    container.innerHTML = '<p>Nenhum funcionário encontrado.</p>';
    return;
  }

  const tabela = `
    <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px; margin-top: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border-radius: 8px; overflow: hidden;">
      <thead>
        <tr style="background-color: #6a4fce; color: white;">
          <th style="padding: 12px 15px; text-align: left;">Nome</th>
          <th style="padding: 12px 15px; text-align: left;">Email</th>
          <th style="padding: 12px 15px; text-align: left;">ID</th>
          <th style="padding: 12px 15px; text-align: left;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${lista.map((f, i) => `
          <tr style="border-bottom: 1px solid #e0e0e0; cursor: pointer;" data-index="${i}">
            <td class="funcionario-nome" style="padding: 12px 15px; font-weight: 600; color: #6a4fce; cursor: pointer;" data-func='${encodeURIComponent(JSON.stringify(f))}'>${f.nome || '-'}</td>
            <td style="padding: 12px 15px;">${f.email || '-'}</td>
            <td style="padding: 12px 15px;">${f.id || '-'}</td>
            <td style="padding: 12px 15px;">${f.ativo ? '<span class="status-ativo">Ativo</span>' : '<span class="status-inativo">Inativo</span>'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = tabela;

  // Adiciona evento para mostrar detalhes
  document.querySelectorAll('.funcionario-nome').forEach(el => {
    el.addEventListener('click', () => {
      const func = JSON.parse(decodeURIComponent(el.dataset.func));
      mostrarDetalhesFuncionario(func);
    });
  });
}

function mostrarDetalhesFuncionario(funcionario) {
  const modal = document.getElementById('modalDetalhesFuncionario');
  if (!modal) return;

  let editando = false;
  const empresaId = 'esc001';
  let funcionarioEditavel = { ...funcionario };

  function renderVisualizacao() {
    modal.innerHTML = `
      <div class="modal-content" style="padding: 20px; background: white; border-radius: 8px; max-width: 500px; margin: auto; position: relative;">
        <span id="fecharDetalhes" style="position: absolute; top: 10px; right: 15px; cursor: pointer; font-size: 24px;">&times;</span>
        <h2>Detalhes do Funcionário</h2>
        <p><strong>Nome:</strong> ${funcionarioEditavel.nome || '-'}</p>
        <p><strong>Email:</strong> ${funcionarioEditavel.email || '-'}</p>
        <p><strong>ID:</strong> ${funcionarioEditavel.id || '-'}</p>
        <p><strong>CPF:</strong> ${funcionarioEditavel.cpf || '-'}</p>
        <p><strong>Telefone:</strong> ${funcionarioEditavel.telefone || '-'}</p>
        <p><strong>Salário:</strong> R$ ${funcionarioEditavel.salario || '-'}</p>
        <p><strong>Data Admissão:</strong> ${funcionarioEditavel.dataAdmissao?.seconds ? new Date(funcionarioEditavel.dataAdmissao.seconds * 1000).toLocaleDateString() : '-'}</p>
        <p><strong>ID Responsável:</strong> ${funcionarioEditavel.idResponsavel || '-'}</p>
        <h3>Endereço</h3>
        <p><strong>Rua:</strong> ${funcionarioEditavel.endereco?.rua || '-'}</p>
        <p><strong>Número:</strong> ${funcionarioEditavel.endereco?.numero || '-'}</p>
        <p><strong>Bairro:</strong> ${funcionarioEditavel.endereco?.bairro || '-'}</p>
        <p><strong>CEP:</strong> ${funcionarioEditavel.endereco?.cep || '-'}</p>
        <p><strong>Cidade:</strong> ${funcionarioEditavel.endereco?.cidade || '-'}</p>
        <p><strong>Estado:</strong> ${funcionarioEditavel.endereco?.estado || '-'}</p>
        <p><strong>Status:</strong> ${funcionarioEditavel.ativo ? 'Ativo' : 'Inativo'}</p>
        <button id="btnEditarFuncionario" style="margin-top: 15px; padding: 8px 12px; background: #6a4fce; color: white; border: none; border-radius: 4px; cursor: pointer;">Editar</button>
      </div>
    `;

    document.getElementById('fecharDetalhes').onclick = () => modal.style.display = 'none';
    document.getElementById('btnEditarFuncionario').onclick = () => {
      editando = true;
      renderEditar();
    };
  }

  function renderEditar() {
    modal.innerHTML = `
      <div class="modal-content" style="padding: 20px; background: white; border-radius: 8px; max-width: 500px; margin: auto; position: relative;">
        <span id="fecharDetalhes" style="position: absolute; top: 10px; right: 15px; cursor: pointer; font-size: 24px;">&times;</span>
        <h2>Editar Funcionário</h2>
        <form id="formEditarFuncionario">
          <label>Nome:<br><input type="text" id="inputNome" value="${funcionarioEditavel.nome || ''}" required></label><br><br>
          <label>Email:<br><input type="email" id="inputEmail" value="${funcionarioEditavel.email || ''}" required></label><br><br>
          <label>ID:<br><input type="text" id="inputId" value="${funcionarioEditavel.id || ''}" required></label><br><br>
          <label>CPF:<br><input type="text" id="inputCpf" value="${funcionarioEditavel.cpf || ''}"></label><br><br>
          <label>Telefone:<br><input type="text" id="inputTelefone" value="${funcionarioEditavel.telefone || ''}"></label><br><br>
          <label>Salário:<br><input type="number" id="inputSalario" value="${funcionarioEditavel.salario || ''}" step="0.01"></label><br><br>
          <label>ID Responsável:<br><input type="text" id="inputIdResponsavel" value="${funcionarioEditavel.idResponsavel || ''}"></label><br><br>
          <h3>Endereço</h3>
          <label>Rua:<br><input type="text" id="inputRua" value="${funcionarioEditavel.endereco?.rua || ''}"></label><br><br>
          <label>Número:<br><input type="text" id="inputNumero" value="${funcionarioEditavel.endereco?.numero || ''}"></label><br><br>
          <label>Bairro:<br><input type="text" id="inputBairro" value="${funcionarioEditavel.endereco?.bairro || ''}"></label><br><br>
          <label>CEP:<br><input type="text" id="inputCep" value="${funcionarioEditavel.endereco?.cep || ''}"></label><br><br>
          <label>Cidade:<br><input type="text" id="inputCidade" value="${funcionarioEditavel.endereco?.cidade || ''}"></label><br><br>
          <label>Estado:<br><input type="text" id="inputEstado" value="${funcionarioEditavel.endereco?.estado || ''}"></label><br><br>
          <label>Status:<br>
            <select id="inputAtivo">
              <option value="true" ${funcionarioEditavel.ativo ? 'selected' : ''}>Ativo</option>
              <option value="false" ${!funcionarioEditavel.ativo ? 'selected' : ''}>Inativo</option>
            </select>
          </label><br><br>
          <button type="submit" style="background: #6a4fce; color: white; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer;">Salvar</button>
          <button type="button" id="btnCancelarEdicao" style="margin-left: 10px; padding: 8px 12px; cursor: pointer;">Cancelar</button>
        </form>
      </div>
    `;

    document.getElementById('fecharDetalhes').onclick = () => modal.style.display = 'none';
    document.getElementById('btnCancelarEdicao').onclick = () => {
      editando = false;
      renderVisualizacao();
    };

    document.getElementById('formEditarFuncionario').onsubmit = async (e) => {
      e.preventDefault();

      funcionarioEditavel.nome = document.getElementById('inputNome').value.trim();
      funcionarioEditavel.email = document.getElementById('inputEmail').value.trim();
      funcionarioEditavel.id = document.getElementById('inputId').value.trim();
      funcionarioEditavel.cpf = document.getElementById('inputCpf').value.trim();
      funcionarioEditavel.telefone = document.getElementById('inputTelefone').value.trim();
      funcionarioEditavel.salario = parseFloat(document.getElementById('inputSalario').value) || 0;
      funcionarioEditavel.idResponsavel = document.getElementById('inputIdResponsavel').value.trim();
      funcionarioEditavel.ativo = document.getElementById('inputAtivo').value === 'true';
      funcionarioEditavel.endereco = {
        rua: document.getElementById('inputRua').value.trim(),
        numero: document.getElementById('inputNumero').value.trim(),
        bairro: document.getElementById('inputBairro').value.trim(),
        cep: document.getElementById('inputCep').value.trim(),
        cidade: document.getElementById('inputCidade').value.trim(),
        estado: document.getElementById('inputEstado').value.trim()
      };

      try {
        const docRef = doc(db, 'empresa', empresaId, 'funcionarios', funcionarioEditavel.idDoc);
        await updateDoc(docRef, {
          nome: funcionarioEditavel.nome,
          email: funcionarioEditavel.email,
          id: funcionarioEditavel.id,
          cpf: funcionarioEditavel.cpf,
          telefone: funcionarioEditavel.telefone,
          salario: funcionarioEditavel.salario,
          idResponsavel: funcionarioEditavel.idResponsavel,
          ativo: funcionarioEditavel.ativo,
          endereco: funcionarioEditavel.endereco
        });

        alert('Funcionário atualizado com sucesso!');
        editando = false;
        renderVisualizacao();
      } catch (error) {
        console.error('Erro ao atualizar funcionário:', error);
        alert('Erro ao atualizar funcionário.');
      }
    };
  }

  modal.style.display = 'block';
  renderVisualizacao();
}
