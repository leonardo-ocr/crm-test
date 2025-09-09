document.addEventListener('DOMContentLoaded', () => {
  // Limites de caracteres
  const limites = {
    nome: 100,
    email: 100,
    cpf: 14,            // Formato com pontos e traço
    rg: 20,
    estadoCivil: 20,
    dependentes: 2,     // 0 a 99
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

  // Permitir só letras e números para RG (sem caracteres especiais)
  function validarRg(rg) {
    return rg.replace(/[^a-zA-Z0-9]/g, '');
  }

  // Permitir números, parênteses, espaços, hífen no telefone
  function validarTelefone(tel) {
    return tel.replace(/[^0-9()\-\s]/g, '');
  }

  // Permitir só números para dependentes, salario, agencia, conta, etc
  function validarNumeros(valor) {
    return valor.replace(/\D/g, '');
  }

  // Aplica limites e validações específicas
  Object.keys(limites).forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;

    input.addEventListener('input', () => {
      // Validações específicas
      if (id === 'rg') {
        input.value = validarRg(input.value);
      } else if (id === 'telefone') {
        input.value = validarTelefone(input.value);
      } else if (['dependentes', 'salario', 'agencia', 'conta'].includes(id)) {
        // Para salario permitir número e ponto (.) (ex: 1234.56)
        if (id === 'salario') {
          input.value = input.value.replace(/[^0-9.]/g, '');

          // Garantir que só tenha um ponto
          const partes = input.value.split('.');
          if (partes.length > 2) {
            input.value = partes[0] + '.' + partes.slice(1).join('');
          }
        } else {
          input.value = validarNumeros(input.value);
        }
      }
      // Limita tamanho
      limitarInput(input, limites[id]);
    });
  });

  // Máscara CPF específica
  const cpfInput = document.getElementById('cpf');
  if (cpfInput) {
    cpfInput.addEventListener('input', () => {
      let cpf = cpfInput.value.replace(/\D/g, '');

      if (cpf.length > 11) cpf = cpf.slice(0, 11);

      cpfInput.value = cpf
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    });
  }

  // Máscara e busca CEP
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
