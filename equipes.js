// Chaves do localStorage, têm que ser iguais às do explorar.
const CHAVE_ESCURO = "modoEscuro";
const CHAVE_FAVORITOS = "favoritos";

// Pega os favoritos que foram salvos na página explorar.
function lerFavoritos() {
  return JSON.parse(localStorage.getItem(CHAVE_FAVORITOS)) || [];
}

// Modo escuro: se já estava ligado antes, liga de novo.
// No clique do botão, troca e salva.
function iniciarModoEscuro() {
  const botao = document.querySelector("#botaoEscuro");
  if (localStorage.getItem(CHAVE_ESCURO) === "true") {
    document.body.classList.add("escuro");
  }
  botao.addEventListener("click", () => {
    const ligado = document.body.classList.toggle("escuro");
    localStorage.setItem(CHAVE_ESCURO, ligado);
  });
}

const API_URL = "https://pokeapi.co/api/v2/pokemon?limit=151";

// Busca os 151 Pokémon na API.
// O id vem no final da URL (ex.: .../pokemon/25/), então pego ele com split.
async function buscarLista() {
  const resposta = await fetch(API_URL);
  if (!resposta.ok) { throw new Error("Erro " + resposta.status); }
  const dados = await resposta.json();
  return dados.results.map((item) => ({ nome: item.name, id: Number(item.url.split("/")[6]) }));
}

// URL do POST e configurações da equipe.
const POST_URL = "https://jsonplaceholder.typicode.com/posts";
const CHAVE_EQUIPES = "equipes";
const TAMANHO_EQUIPE = 6;

// Variáveis da página.
let listaDePokemons = [];
let equipeAtual = [];
let equipes = JSON.parse(localStorage.getItem(CHAVE_EQUIPES)) || [];
const favoritos = lerFavoritos();

// Mostra os Pokémon para escolher, filtrando pela busca e pelos favoritos.
function mostrarDisponiveis() {
  const texto = document.querySelector("#busca").value.toLowerCase();
  const soFavoritos = document.querySelector("#soFavoritos").checked;
  const container = document.querySelector("#listaDisponiveis");
  container.textContent = "";
  const filtrados = listaDePokemons.filter((p) =>
    p.nome.includes(texto) && (!soFavoritos || favoritos.includes(p.id)));
  if (filtrados.length === 0) {
    container.textContent = "Nenhum Pokémon encontrado.";
    return;
  }
  filtrados.forEach((pokemon) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.classList.add("mini");
    botao.classList.toggle("escolhido", Boolean(equipeAtual.find((p) => p.id === pokemon.id)));
    botao.textContent = "#" + pokemon.id + " " + pokemon.nome;
    botao.addEventListener("click", () => adicionarNaEquipe(pokemon));
    container.appendChild(botao);
  });
}

// Adiciona o Pokémon na equipe, mas não deixa repetir nem passar de 6.
function adicionarNaEquipe(pokemon) {
  const aviso = document.querySelector("#aviso");
  aviso.textContent = "";
  if (equipeAtual.find((p) => p.id === pokemon.id)) {
    aviso.textContent = pokemon.nome + " já está na equipe.";
  } else if (equipeAtual.length >= TAMANHO_EQUIPE) {
    aviso.textContent = "A equipe já tem " + TAMANHO_EQUIPE + " Pokémon.";
  } else {
    equipeAtual.push(pokemon);
  }
  mostrarEquipeAtual();
  mostrarDisponiveis();
}

// Mostra a equipe que está sendo montada, cada um com botão de remover.
function mostrarEquipeAtual() {
  const lista = document.querySelector("#equipeAtual");
  lista.textContent = "";
  equipeAtual.forEach((pokemon) => {
    const item = document.createElement("li");
    item.textContent = pokemon.nome + " ";
    const remover = document.createElement("button");
    remover.type = "button";
    remover.classList.add("mini");
    remover.textContent = "Remover";
    remover.addEventListener("click", () => {
      equipeAtual = equipeAtual.filter((p) => p.id !== pokemon.id);
      mostrarEquipeAtual();
      mostrarDisponiveis();
    });
    item.appendChild(remover);
    lista.appendChild(item);
  });
  document.querySelector("#contador").textContent =
    "Selecionados: " + equipeAtual.length + "/" + TAMANHO_EQUIPE;
}

// Mostra as equipes que já foram criadas (salvas no localStorage).
function mostrarEquipesSalvas() {
  const container = document.querySelector("#listaEquipes");
  container.textContent = "";
  if (equipes.length === 0) {
    container.textContent = "Nenhuma equipe criada ainda.";
    return;
  }
  equipes.forEach((equipe, indice) => {
    const cartao = document.createElement("article");
    cartao.classList.add("cartao");
    const titulo = document.createElement("h3");
    titulo.textContent = equipe.nome;
    const data = document.createElement("p");
    data.textContent = "Criada em: " + new Date(equipe.criadaEm).toLocaleString("pt-BR");
    const nomes = document.createElement("p");
    nomes.textContent = equipe.pokemons.join(", ");
    cartao.appendChild(titulo);
    cartao.appendChild(data);
    const excluir = document.createElement("button");
    excluir.type = "button";
    excluir.classList.add("botao");
    excluir.textContent = "Excluir equipe";
    excluir.addEventListener("click", () => {
      if (confirm("Excluir a equipe " + equipe.nome + "?")) {
        equipes.splice(indice, 1);
        localStorage.setItem(CHAVE_EQUIPES, JSON.stringify(equipes));
        mostrarEquipesSalvas();
      }
    });
    cartao.appendChild(nomes);
    cartao.appendChild(excluir);
    container.appendChild(cartao);
  });
}

// Formulário de criar equipe.
function iniciarFormulario() {
  const formulario = document.querySelector("#formEquipe");
  const campoNome = document.querySelector("#nomeEquipe");
  const resultado = document.querySelector("#resultadoEnvio");

  // Quando sai do campo vazio, ele fica vermelho.
  campoNome.addEventListener("blur", () => {
    campoNome.classList.toggle("erro", campoNome.value.trim() === "");
  });

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    // Só deixa criar com 6 Pokémon.
    if (equipeAtual.length !== TAMANHO_EQUIPE) {
      resultado.classList.add("erro");
      resultado.textContent = "Escolha exatamente " + TAMANHO_EQUIPE + " Pokémon.";
      return;
    }
    const equipe = {
      nome: campoNome.value.trim(),
      criadaEm: new Date().toISOString(),
      pokemons: equipeAtual.map((p) => p.nome)
    };
    // Manda a equipe para o JSONPlaceholder. Se der certo (201), salva no localStorage.
    try {
      const resposta = await fetch(POST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(equipe)
      });
      if (!resposta.ok) { throw new Error("Erro " + resposta.status); }
      equipes.push(equipe);
      localStorage.setItem(CHAVE_EQUIPES, JSON.stringify(equipes));
      resultado.classList.remove("erro");
      resultado.textContent = "Equipe criada! Status: " + resposta.status;
      formulario.reset();
      equipeAtual = [];
      mostrarEquipeAtual();
      mostrarDisponiveis();
      mostrarEquipesSalvas();
    } catch (erro) {
      resultado.classList.add("erro");
      resultado.textContent = "Não foi possível criar a equipe. Tente novamente.";
    }
  });
}

// Quando a página carrega.
document.addEventListener("DOMContentLoaded", async () => {
  iniciarModoEscuro();
  iniciarFormulario();
  mostrarEquipeAtual();
  mostrarEquipesSalvas();
  const status = document.querySelector("#status");
  status.textContent = "Carregando...";
  try {
    listaDePokemons = await buscarLista();
    status.textContent = "";
    mostrarDisponiveis();
  } catch (erro) {
    status.textContent = "Não foi possível carregar a lista de Pokémon.";
  }
  document.querySelector("#busca").addEventListener("input", mostrarDisponiveis);
  document.querySelector("#soFavoritos").addEventListener("change", mostrarDisponiveis);
});
