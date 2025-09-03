import { db, auth } from './firebase-config.js';
import {
  collection, getDocs, query, addDoc, doc, updateDoc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

const empresaId = 'esc001';
const funcionariosRef = collection(db, 'empresa', empresaId, 'funcionarios');

export function initFuncionarios() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.warn('Usuário não autenticado');
      return;
    }

    try {
      const funcionarios = await buscarFuncionarios();
      renderizarFuncionarios(funcionarios);
      configurarBusca(funcionarios);
      configurarModalAdicionar(funcionarios);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    }
  });
}

async function buscarFuncionarios() {
  const snapshot = await getDocs(query(funcionariosRef));
  return snapshot.docs.map(doc => ({ idDoc: doc.id, ...doc.data() }));
}

function configurarBusca(funcionarios) {
  const input = document.getElementById('searchInput');
  const btn = document.getElementById('searchBtn');

  if (!input || !btn) return;

  const buscar = () => {
    const termo = input.value.trim().toLowerCase();
    const filtrados = funcionarios.filter(f =>
      (f.nome?.toLowerCase().includes(termo)) ||
      (f.email?.toLowerCase().includes(termo)) ||
      (f.id?.toLowerCase().includes(termo))
    );
    renderizarFuncionarios(filtrados);
  };

  input.addEventListener('input', buscar);
  btn.addEventListener('click', e => {
    e.preventDefault();
    buscar();
  });
}

function configurarModalAdicionar(funcionarios) {
  const btn = document.getElementById('addFuncionarioBtn');
  const modal = document.getElementById('modalAdicionarFuncionario');
  const fechar = document.getElementById('fecharModalFuncionario');
  const form = document.getElementById('formAdicionarFuncionario');

  if (!btn || !modal || !fechar || !form) return;

  btn.onclick = () => modal.style.display = 'block';
  fechar.onclick = () => modal.style.display = 'none';
  window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };

  form.onsubmit = async (e) => {
    e.preventDefault();

    const novoFuncionario = {
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
      id: form.id.value.trim(),
      ativo: true,
      cargo: `/empresa/${empresaId}/cargo/dono`,
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
      await addDoc(funcionariosRef, novoFuncionario);
      alert('Funcionário adicionado com sucesso!');
      form.reset();
      modal.style.display = 'none';

      // Atualiza a lista sem recarregar a página
      const atualizados = await buscarFuncionarios();
      renderizarFuncionarios(atualizados);
      configurarBusca(atualizados);
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
        ${lista.map(f => `
          <tr style="border-bottom: 1px solid #e0e0e0; cursor: pointer;">
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

  document.querySelectorAll('.funcionario-nome').forEach(el => {
    el.addEventListener('click', () => {
      const funcionario = JSON.parse(decodeURIComponent(el.dataset.func));
      mostrarDetalhesFuncionario(funcionario);
    });
  });
}

function mostrarDetalhesFuncionario(funcionario) {
  const modal = document.getElementById('modalDetalhesFuncionario');
  if (!modal) return;

  let editando = false;
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
    <div class="modal-content">
      <span class="close-btn" id="fecharModalDetalhes">&times;</span>
      <div class="modal-header">Editar Funcionário</div>
      <div class="modal-body">
        <label>Nome:<br><input type="text" id="inputNome" value="${funcionarioEditavel.nome || ''}" required></label>
        <label>Email:<br><input type="email" id="inputEmail" value="${funcionarioEditavel.email || ''}" required></label>
        <label>ID:<br><input type="text" id="inputId" value="${funcionarioEditavel.id || ''}" required></label>
        <label>CPF:<br><input type="text" id="inputCpf" value="${funcionarioEditavel.cpf || ''}"></label>
        <label>Telefone:<br><input type="text" id="inputTelefone" value="${funcionarioEditavel.telefone || ''}"></label>
        <label>Salário:<br><input type="number" id="inputSalario" step="0.01" value="${funcionarioEditavel.salario || ''}"></label>
        <label>ID Responsável:<br><input type="text" id="inputIdResponsavel" value="${funcionarioEditavel.idResponsavel || ''}"></label>

        <h3 style="margin-top: 20px; color: #6a4fce;">Endereço</h3>
        <label>Rua:<br><input type="text" id="inputRua" value="${funcionarioEditavel.endereco?.rua || ''}"></label>
        <label>Número:<br><input type="text" id="inputNumero" value="${funcionarioEditavel.endereco?.numero || ''}"></label>
        <label>Bairro:<br><input type="text" id="inputBairro" value="${funcionarioEditavel.endereco?.bairro || ''}"></label>
        <label>CEP:<br><input type="text" id="inputCep" value="${funcionarioEditavel.endereco?.cep || ''}"></label>
        <label>Cidade:<br><input type="text" id="inputCidade" value="${funcionarioEditavel.endereco?.cidade || ''}"></label>
        <label>Estado:<br><input type="text" id="inputEstado" value="${funcionarioEditavel.endereco?.estado || ''}"></label>

        <label>Status:<br>
          <select id="inputAtivo">
            <option value="true" ${funcionarioEditavel.ativo ? 'selected' : ''}>Ativo</option>
            <option value="false" ${!funcionarioEditavel.ativo ? 'selected' : ''}>Inativo</option>
          </select>
        </label>
      </div>
      <div class="modal-footer">
        <button type="submit" id="btnSalvarFuncionario">Salvar</button>
        <button type="button" id="btnCancelarEdicao">Cancelar</button>
      </div>
    </div>
  `;

  document.getElementById('fecharModalDetalhes').onclick = () => modal.style.display = 'none';
  document.getElementById('btnCancelarEdicao').onclick = () => {
    editando = false;
    renderVisualizacao();
  };

  document.getElementById('btnSalvarFuncionario').onclick = async (e) => {
    e.preventDefault();

    funcionarioEditavel = {
      ...funcionarioEditavel,
      nome: document.getElementById('inputNome').value.trim(),
      email: document.getElementById('inputEmail').value.trim(),
      id: document.getElementById('inputId').value.trim(),
      cpf: document.getElementById('inputCpf').value.trim(),
      telefone: document.getElementById('inputTelefone').value.trim(),
      salario: parseFloat(document.getElementById('inputSalario').value) || 0,
      idResponsavel: document.getElementById('inputIdResponsavel').value.trim(),
      ativo: document.getElementById('inputAtivo').value === 'true',
      endereco: {
        rua: document.getElementById('inputRua').value.trim(),
        numero: document.getElementById('inputNumero').value.trim(),
        bairro: document.getElementById('inputBairro').value.trim(),
        cep: document.getElementById('inputCep').value.trim(),
        cidade: document.getElementById('inputCidade').value.trim(),
        estado: document.getElementById('inputEstado').value.trim()
      }
    };

    try {
      const docRef = doc(db, 'empresa', empresaId, 'funcionarios', funcionarioEditavel.idDoc);
      await updateDoc(docRef, funcionarioEditavel);

      alert('Funcionário atualizado com sucesso!');
      editando = false;
      modal.style.display = 'none';
      renderVisualizacao();
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
      alert('Erro ao atualizar funcionário.');
    }
  };

  modal.style.display = 'block';
}

  modal.style.display = 'block';
  renderVisualizacao();
}
