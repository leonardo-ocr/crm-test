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
