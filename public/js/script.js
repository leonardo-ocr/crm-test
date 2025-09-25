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
  }})

  // Para abrir o modal
document.getElementById("modalDetalhesTurma").style.display = "flex";

// Para fechar o modal
document.getElementById("modalDetalhesTurma").style.display = "none";

