const form = document.getElementById('form-idade');
const nomeInput = document.getElementById('nome');
const nascimentoInput = document.getElementById('nascimento');
const mensagem = document.getElementById('mensagem');

function formatarErro(texto) {
  mensagem.textContent = texto;
  mensagem.classList.add('is-error');
}

function limparErro() {
  mensagem.classList.remove('is-error');
}

function validarData(dataTexto) {
  const padrao = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const partes = dataTexto.match(padrao);

  if (!partes) {
    return null;
  }

  const dia = Number(partes[1]);
  const mes = Number(partes[2]);
  const ano = Number(partes[3]);
  const data = new Date(ano, mes - 1, dia);

  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return null;
  }

  return { dia, mes, ano };
}

function calcularIdade(dadosNascimento) {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();

  // O enunciado principal pede a diferença entre anos; aqui ajustamos mês e dia
  // para evitar mostrar uma idade que ainda não foi completada no ano corrente.
  let idade = anoAtual - dadosNascimento.ano;

  if (
    hoje.getMonth() + 1 < dadosNascimento.mes ||
    (hoje.getMonth() + 1 === dadosNascimento.mes && hoje.getDate() < dadosNascimento.dia)
  ) {
    idade -= 1;
  }

  return idade;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const nome = nomeInput.value.trim();
  const nascimento = nascimentoInput.value.trim();

  if (!nome || !nascimento) {
    formatarErro('Preencha o nome e a data de nascimento para continuar.');
    return;
  }

  const dadosNascimento = validarData(nascimento);

  if (!dadosNascimento) {
    formatarErro('Informe uma data válida no formato DD/MM/AAAA.');
    return;
  }

  limparErro();

  const idade = calcularIdade(dadosNascimento);
  mensagem.textContent = `${nome}, você tem ${idade} anos`;
});