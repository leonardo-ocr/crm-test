function atualizarHorarioData() {
  const agora = new Date();

  const horas = agora.getHours().toString().padStart(2, '0');
  const minutos = agora.getMinutes().toString().padStart(2, '0');
  const segundos = agora.getSeconds().toString().padStart(2, '0');

  const dia = agora.getDate().toString().padStart(2, '0');
  const mes = (agora.getMonth() + 1).toString().padStart(2, '0');
  const ano = agora.getFullYear();

  const relogio = document.getElementById('relogio');
  const data = document.getElementById('data');

  relogio.textContent = `${horas}:${minutos}:${segundos}`;
  data.textContent = `${dia}/${mes}/${ano}`;
}

setInterval(atualizarHorarioData, 1000);
atualizarHorarioData(); // atualiza já no carregamento

const profileToggle = document.getElementById('profile-toggle');
const dropdownMenu = document.getElementById('dropdown-menu');

profileToggle.addEventListener('click', () => {
  dropdownMenu.style.display =
    dropdownMenu.style.display === 'block' ? 'none' : 'block';
});

// (Opcional) Fecha se clicar fora
document.addEventListener('click', (e) => {
  if (!profileToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
    dropdownMenu.style.display = 'none';
  }
});
