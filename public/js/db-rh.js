import { db, auth } from './firebase-config.js';
import {
  collection, getDocs, query, addDoc, doc, updateDoc, Timestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

const empresaId = 'esc001';
const funcionariosRef = collection(db, 'empresa', empresaId, 'funcionarios');

let funcionariosCache = []; // Armazena os funcionários em cache

export function initFuncionarios() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.warn('Usuário não autenticado');
      return;
    }

    try {
      funcionariosCache = await buscarFuncionarios(); // Armazena a lista de funcionários no cache
      renderizarFuncionarios(funcionariosCache);  // Renderiza os funcionários inicialmente
      configurarBusca(funcionariosCache);  // Configura a busca
      configurarModalAdicionar(funcionariosRef);  // Configura o modal para adicionar funcionários

      // Aplica o filtro logo após a renderização inicial
      // Para aplicar filtro logo após carregar, chama a função 'buscar' da configuração de busca
      // Ou apenas chama buscar diretamente
      if (funcionariosCache.length > 0) {
        // chama a função de busca com o cache atual para renderizar
        // buscar() não está no escopo, então você pode fazer o filtro manual aqui, 
        // ou criar uma função global de filtro que pode ser usada.
      }


    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    }
  });
}

function formatarDataFirebase(data) {
  if (!data) return '-';

  try {
    // Se for um objeto do Firestore (Timestamp), converte
    if (data.toDate) {
      data = data.toDate();
    }

    // Se já for Date ou string válida
    const dateObj = new Date(data);

    // Verifica se a data é válida
    if (isNaN(dateObj.getTime())) return '-';

    const dia = String(dateObj.getDate()).padStart(2, '0');
    const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
    const ano = dateObj.getFullYear();

    return `${dia}/${mes}/${ano}`;
  } catch (e) {
    return '-';
  }
}

function formatarDataParaString(dataInput) {
  const date = new Date(dataInput);
  if (isNaN(date)) return '-';
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
}



function configurarBusca(funcionarios) {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const filtroStatusFuncionario = document.getElementById('filtroStatusFuncionario'); // <- novo, adaptado para funcionários

  if (!searchInput || !searchBtn || !filtroStatusFuncionario) return;

  const buscar = () => {
    const query = searchInput.value.trim().toLowerCase(); // Pesquisa em minúsculas
    const statusSelecionado = filtroStatusFuncionario.value;

    const filtrados = funcionarios.filter(funcionario => {
      // Garantir que todos os campos sejam tratados como strings antes da comparação
      const nome = funcionario.nome ? funcionario.nome.toLowerCase() : '';
      const email = funcionario.email ? funcionario.email.toLowerCase() : '';
      const idDoc = funcionario.idDoc ? funcionario.idDoc.toLowerCase() : '';
      const cargo = funcionario.cargo ? (typeof funcionario.cargo === 'string' ? funcionario.cargo.toLowerCase() : '') : '';

      // Verifica se qualquer campo corresponde ao valor de pesquisa
      const textoCorresponde =
        nome.includes(query) ||
        email.includes(query) ||
        idDoc.includes(query) ||
        cargo.includes(query); // Verifica se o cargo é uma string e compara

      // Verifica o status
      const statusFuncionario = funcionario.ativo ? 'ativo' : 'inativo';
      const statusCorresponde =
        statusSelecionado === 'todos' || statusSelecionado === statusFuncionario;

      return textoCorresponde && statusCorresponde; // Filtra tanto pelo texto quanto pelo status
    });

    renderizarFuncionarios(filtrados); // Atualiza a tabela de funcionários filtrados
  };



  searchInput.addEventListener('input', buscar); // Busca ao digitar
  searchBtn.addEventListener('click', (e) => { // Busca ao clicar no botão
    e.preventDefault();
    buscar();
  });
  filtroStatusFuncionario.addEventListener('change', buscar); // Filtro de status ao alterar o status selecionado
}

async function buscarFuncionarios() {
  const snapshot = await getDocs(query(funcionariosRef));
  return snapshot.docs.map(doc => ({ idDoc: doc.id, ...doc.data() }));
}

async function configurarModalAdicionar(funcionariosRef) {
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
  cpf: form.cpf.value.trim(),
  rg: form.rg.value.trim(),
  estadoCivil: form.estadoCivil.value.trim(),
  dependentes: parseInt(form.dependentes.value) || 0,
  cargo: form.cargo.value.trim(),
  departamento: form.departamento.value.trim(),
  jornadaTrabalho: form.jornadaTrabalho.value.trim(),
  tipoContrato: form.tipoContrato.value.trim(),
  dataNascimento: formatarDataParaString(dataNascimentoInput.value),
  dataAdmissao: formatarDataParaString(dataAdmissaoInput.value),
  salario: parseFloat(form.salario.value) || 0,
  telefone: form.telefone.value.trim(),
  banco: form.banco.value.trim(),
  agencia: form.agencia.value.trim(),
  conta: form.conta.value.trim(),
  carteiraTrabalho: form.carteiraTrabalho.value.trim(),
  pisPasep: form.pisPasep.value.trim(),
  tituloEleitor: form.tituloEleitor.value.trim(),
  idResponsavel: form.idResponsavel.value.trim(),
  ativo: true,
  endereco: {
    rua: form.rua.value.trim(),
    numero: form.numero.value.trim(),
    bairro: form.bairro.value.trim(),
    cep: form.cep.value.trim(),
    cidade: form.cidade.value.trim(),
    estado: form.estado.value.trim()
  }
};


    try {
      const docRef = await addDoc(funcionariosRef, novoFuncionario);
      alert('Funcionário adicionado com sucesso!');
      form.reset();
      modal.style.display = 'none';

      // Agora que o documento foi criado, podemos recuperar o ID gerado automaticamente
      novoFuncionario.idDoc = docRef.id; // Atribui o ID gerado pelo Firestore ao funcionário

      // Atualiza a lista de funcionários sem recarregar a página
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
    <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px; margin-top: 20px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); border-radius: 8px; overflow: hidden;">
      <thead>
        <tr style="background-color: #6a4fce; color: white;">
          <th style="padding: 12px 15px; text-align: left;">Nome</th>
          <th style="padding: 12px 15px; text-align: left;">Cargo</th>
          <th style="padding: 12px 15px; text-align: left;">ID</th>
          <th style="padding: 12px 15px; text-align: left;">Status</th> <!-- Coluna de Status -->
        </tr>
      </thead>
      <tbody>
        ${lista.map(f => `
          <tr style="border-bottom: 1px solid #e0e0e0; cursor: pointer;">
            <td class="funcionario-nome" style="padding: 12px 15px; font-weight: 600; color: #6a4fce; cursor: pointer;" data-func='${encodeURIComponent(JSON.stringify(f))}'>${f.nome || '-'}</td>
            <td style="padding: 12px 15px;">${f.cargo || '-'}</td>
            <td style="padding: 12px 15px;">${f.idDoc || '-'}</td>
            <!-- Exibindo o status diretamente, sem formatação -->
            <td style="padding: 12px 15px;">${f.ativo ? 'Ativo' : 'Inativo'}</td>
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

  let funcionarioEditavel = { ...funcionario };

  // Renderização dos detalhes no modal
  modal.innerHTML = `
    <div class="modal-content" style="padding: 20px; background: white; border-radius: 8px; max-width: 600px; margin: auto; position: relative;">
      <span id="fecharDetalhes" style="position: absolute; top: 10px; right: 15px; cursor: pointer; font-size: 24px;">&times;</span>
      <h2>Detalhes do Funcionário</h2>
      <p><strong>Nome:</strong> ${funcionarioEditavel.nome || '-'}</p>
      <p><strong>Cargo:</strong> ${funcionarioEditavel.cargo || '-'}</p>
      <p><strong>ID:</strong> ${funcionarioEditavel.idDoc || '-'}</p> <!-- ID gerado automaticamente pelo Firestore -->
      <p><strong>CPF:</strong> ${funcionarioEditavel.cpf || '-'}</p>
      <p><strong>RG:</strong> ${funcionarioEditavel.rg || '-'}</p>
      <p><strong>Estado Civil:</strong> ${funcionarioEditavel.estadoCivil || '-'}</p>
      <p><strong>Dependentes:</strong> ${funcionarioEditavel.dependentes ?? '-'}</p>
      <p><strong>Departamento:</strong> ${funcionarioEditavel.departamento || '-'}</p>
      <p><strong>Jornada de Trabalho:</strong> ${funcionarioEditavel.jornadaTrabalho || '-'}</p>
      <p><strong>Tipo de Contrato:</strong> ${funcionarioEditavel.tipoContrato || '-'}</p>
      <p><strong>Data de Nascimento:</strong> ${formatarDataFirebase(funcionarioEditavel.dataNascimento)}</p>
      <p><strong>Data de Admissão:</strong> ${formatarDataFirebase(funcionarioEditavel.dataAdmissao)}</p>
      <p><strong>Salário:</strong> R$ ${funcionarioEditavel.salario || '-'}</p>
      <p><strong>Telefone:</strong> ${funcionarioEditavel.telefone || '-'}</p>
      <p><strong>ID Responsável:</strong> ${funcionarioEditavel.idResponsavel || '-'}</p>
      <h3>Endereço</h3>
      <p><strong>Rua:</strong> ${funcionarioEditavel.endereco?.rua || '-'}</p>
      <p><strong>Número:</strong> ${funcionarioEditavel.endereco?.numero || '-'}</p>
      <p><strong>Bairro:</strong> ${funcionarioEditavel.endereco?.bairro || '-'}</p>
      <p><strong>CEP:</strong> ${funcionarioEditavel.endereco?.cep || '-'}</p>
      <p><strong>Cidade:</strong> ${funcionarioEditavel.endereco?.cidade || '-'}</p>
      <p><strong>Estado:</strong> ${funcionarioEditavel.endereco?.estado || '-'}</p>

      <h3>Bancários</h3>
      <p><strong>Banco:</strong> ${funcionarioEditavel.banco || '-'}</p>
      <p><strong>Agência:</strong> ${funcionarioEditavel.agencia || '-'}</p>
      <p><strong>Conta:</strong> ${funcionarioEditavel.conta || '-'}</p>

      <h3>Documentos</h3>
      <p><strong>Carteira de Trabalho:</strong> ${funcionarioEditavel.carteiraTrabalho || '-'}</p>
      <p><strong>PIS/PASEP:</strong> ${funcionarioEditavel.pisPasep || '-'}</p>
      <p><strong>Título de Eleitor:</strong> ${funcionarioEditavel.tituloEleitor || '-'}</p>

      <p><strong>Status:</strong> <span class="${funcionarioEditavel.ativo ? 'status-ativo' : 'status-inativo'}">${funcionarioEditavel.ativo ? 'Ativo' : 'Inativo'}</span></p>

      <button id="btnEditarFuncionario" style="margin-top: 15px; padding: 8px 12px; background: #6a4fce; color: white; border: none; border-radius: 4px; cursor: pointer;">Editar</button>
    </div>
  `;

  document.getElementById('fecharDetalhes').onclick = () => modal.style.display = 'none';

  // Aqui é onde o "Editar" é tratado. 
  // A função renderEditar será chamada quando o usuário clicar no botão "Editar"
  document.getElementById('btnEditarFuncionario').onclick = () => {
    renderEditar(funcionarioEditavel);  // Chama a função renderEditar com os dados para editar.
  };

  // Exibe o modal
  modal.style.display = 'block';
}

function formatarDataISO(dataOriginal) {
  if (!dataOriginal) return '';

  let data;
  if (typeof dataOriginal.toDate === 'function') {
    data = dataOriginal.toDate();
  } else {
    data = new Date(dataOriginal);
  }

  if (isNaN(data.getTime())) return ''; // <- Protege contra datas inválidas

  return data.toISOString().split('T')[0];
}


function renderEditar(funcionarioEditavel) {
  const modal = document.getElementById('modalDetalhesFuncionario');
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-btn" id="fecharModalDetalhes">&times;</span>
      <div class="modal-header">Editar Funcionário</div>
      <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
        <label>Nome:<br><input type="text" id="inputNome" value="${funcionarioEditavel.nome || ''}"></label>
        <label>Email:<br><input type="email" id="inputEmail" value="${funcionarioEditavel.email || ''}"></label>
        <label>ID:<br><input type="text" value="${funcionarioEditavel.idDoc || ''}" disabled></label>
        <label>CPF:<br><input type="text" id="inputCpf" value="${funcionarioEditavel.cpf || ''}"></label>
        <label>RG:<br><input type="text" id="inputRg" value="${funcionarioEditavel.rg || ''}"></label>
        <label>Estado Civil:<br><input type="text" id="inputEstadoCivil" value="${funcionarioEditavel.estadoCivil || ''}"></label>
        <label>Dependentes:<br><input type="number" id="inputDependentes" value="${funcionarioEditavel.dependentes || 0}"></label>
        <label>Cargo:<br><input type="text" id="inputCargo" value="${funcionarioEditavel.cargo || ''}"></label>
        <label>Departamento:<br><input type="text" id="inputDepartamento" value="${funcionarioEditavel.departamento || ''}"></label>
        <label>Jornada de Trabalho:<br><input type="text" id="inputJornada" value="${funcionarioEditavel.jornadaTrabalho || ''}"></label>
        <label>Tipo de Contrato:<br><input type="text" id="inputContrato" value="${funcionarioEditavel.tipoContrato || ''}"></label>
        <label>Data de Nascimento:<br>
        <input type="date" id="inputNascimento" value="${formatarDataISO(funcionarioEditavel.dataNascimento)}">
        </label>
      <label>Data de Admissão:<br>
        <input type="date" id="inputAdmissao" value="${formatarDataISO(funcionarioEditavel.dataAdmissao)}">
      </label>
        <label>Salário:<br><input type="number" step="0.01" id="inputSalario" value="${funcionarioEditavel.salario || ''}"></label>
        <label>Telefone:<br><input type="text" id="inputTelefone" value="${funcionarioEditavel.telefone || ''}"></label>
        <label>ID Responsável:<br><input type="text" id="inputIdResponsavel" value="${funcionarioEditavel.idResponsavel || ''}"></label>

        <h3 style="margin-top: 20px; color: #6a4fce;">Endereço</h3>
        <label>Rua:<br><input type="text" id="inputRua" value="${funcionarioEditavel.endereco?.rua || ''}"></label>
        <label>Número:<br><input type="text" id="inputNumero" value="${funcionarioEditavel.endereco?.numero || ''}"></label>
        <label>Bairro:<br><input type="text" id="inputBairro" value="${funcionarioEditavel.endereco?.bairro || ''}"></label>
        <label>CEP:<br><input type="text" id="inputCep" value="${funcionarioEditavel.endereco?.cep || ''}"></label>
        <label>Cidade:<br><input type="text" id="inputCidade" value="${funcionarioEditavel.endereco?.cidade || ''}"></label>
        <label>Estado:<br><input type="text" id="inputEstado" value="${funcionarioEditavel.endereco?.estado || ''}"></label>

        <h3 style="margin-top: 20px; color: #6a4fce;">Bancários</h3>
        <label>Banco:<br><input type="text" id="inputBanco" value="${funcionarioEditavel.banco || ''}"></label>
        <label>Agência:<br><input type="text" id="inputAgencia" value="${funcionarioEditavel.agencia || ''}"></label>
        <label>Conta:<br><input type="text" id="inputConta" value="${funcionarioEditavel.conta || ''}"></label>

        <h3 style="margin-top: 20px; color: #6a4fce;">Documentos</h3>
        <label>Carteira de Trabalho:<br><input type="text" id="inputCarteiraTrabalho" value="${funcionarioEditavel.carteiraTrabalho || ''}"></label>
        <label>PIS/PASEP:<br><input type="text" id="inputPisPasep" value="${funcionarioEditavel.pisPasep || ''}"></label>
        <label>Título de Eleitor:<br><input type="text" id="inputTituloEleitor" value="${funcionarioEditavel.tituloEleitor || ''}"></label>

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

  // Fechar o modal
  document.getElementById('fecharModalDetalhes').onclick = () => modal.style.display = 'none';

  // Cancelar a edição
  document.getElementById('btnCancelarEdicao').onclick = () => {
    modal.style.display = 'none';  // Fechar o modal
    renderizarFuncionarios(funcionariosCache);  // Exibe a lista de funcionários
  };

  // Salvar as alterações no Firestore
  document.getElementById('btnSalvarFuncionario').onclick = async () => {
    const funcionarioAtualizado = {
      nome: document.getElementById('inputNome').value.trim(),
      email: document.getElementById('inputEmail').value.trim(),
      cpf: document.getElementById('inputCpf').value.trim(),
      rg: document.getElementById('inputRg').value.trim(),
      estadoCivil: document.getElementById('inputEstadoCivil').value.trim(),
      dependentes: parseInt(document.getElementById('inputDependentes').value) || 0,
      cargo: document.getElementById('inputCargo').value.trim(),
      departamento: document.getElementById('inputDepartamento').value.trim(),
      jornadaTrabalho: document.getElementById('inputJornada').value.trim(),
      tipoContrato: document.getElementById('inputContrato').value.trim(),
      dataNascimento: formatarDataParaString(document.getElementById('inputDataNascimento').value),
      dataAdmissao: formatarDataParaString(document.getElementById('inputDataAdmissao').value),
      salario: parseFloat(document.getElementById('inputSalario').value) || 0,
      telefone: document.getElementById('inputTelefone').value.trim(),
      idResponsavel: document.getElementById('inputIdResponsavel').value.trim(),
      endereco: {
        rua: document.getElementById('inputRua').value.trim(),
        numero: document.getElementById('inputNumero').value.trim(),
        bairro: document.getElementById('inputBairro').value.trim(),
        cep: document.getElementById('inputCep').value.trim(),
        cidade: document.getElementById('inputCidade').value.trim(),
        estado: document.getElementById('inputEstado').value.trim()
      },
      banco: document.getElementById('inputBanco').value.trim(),
      agencia: document.getElementById('inputAgencia').value.trim(),
      conta: document.getElementById('inputConta').value.trim(),
      carteiraTrabalho: document.getElementById('inputCarteiraTrabalho').value.trim(),
      pisPasep: document.getElementById('inputPisPasep').value.trim(),
      tituloEleitor: document.getElementById('inputTituloEleitor').value.trim(),
      ativo: document.getElementById('inputAtivo').value === 'true'
    };

    try {
      // Atualiza o documento do funcionário no Firestore
      const funcionarioDocRef = doc(db, 'empresa', empresaId, 'funcionarios', funcionarioEditavel.idDoc);
      await updateDoc(funcionarioDocRef, funcionarioAtualizado);

      alert('Funcionário atualizado com sucesso!');
      modal.style.display = 'none';  // Fecha o modal

      // Atualiza a lista de funcionários sem recarregar a página
      const funcionarios = await buscarFuncionarios();
      renderizarFuncionarios(funcionarios);
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
      alert('Erro ao atualizar funcionário.');
    }
  };
}
