// ===== CONSTANTES =====
const CHAVE_ESCURO = "modoEscuro";
const CHAVE_FAVORITOS = "favoritos";

// Lê a lista de ids favoritos salva no navegador
function lerFavoritos() {
  return JSON.parse(localStorage.getItem(CHAVE_FAVORITOS)) || [];
}

// Liga/desliga o modo escuro e guarda a preferência
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

let listaDePokemons = []; // dados da API ficam neste array
let favoritos = lerFavoritos();

// GET: busca a lista e depois os detalhes de cada Pokémon
async function buscarPokemons() {
  const status = document.querySelector("#status");
  status.textContent = "Carregando...";
  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) { throw new Error("Erro " + resposta.status); }
    const lista = await resposta.json();
    const detalhes = await Promise.all(lista.results.map(async (item) => {
      const r = await fetch(item.url);
      if (!r.ok) { throw new Error("Erro " + r.status); }
      return r.json();
    }));
    listaDePokemons = detalhes.map((p) => ({
      id: p.id,
      nome: p.name,
      imagem: p.sprites.front_default,
      tipo: p.types.map((t) => t.type.name).join(", ")
    }));
    status.textContent = "";
    aplicarFiltros();
  } catch (erro) {
    status.textContent = "Não foi possível carregar os Pokémon. Tente novamente.";
  }
}

// Marca ou desmarca um favorito e salva no localStorage
function alternarFavorito(id) {
  if (favoritos.includes(id)) {
    favoritos = favoritos.filter((fav) => fav !== id);
  } else {
    favoritos.push(id);
  }
  localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(favoritos));
}

// Cria os cartões na tela
function mostrarCartoes(lista) {
  const container = document.querySelector("#listaCartoes");
  container.textContent = "";
  lista.forEach((pokemon) => {
    const cartao = document.createElement("article");
    cartao.classList.add("cartao");
    const imagem = document.createElement("img");
    imagem.src = pokemon.imagem;
    imagem.alt = "Imagem do Pokémon " + pokemon.nome;
    const titulo = document.createElement("h3");
    titulo.textContent = "#" + pokemon.id + " " + pokemon.nome;
    const tipo = document.createElement("p");
    tipo.textContent = "Tipo: " + pokemon.tipo;
    const botao = document.createElement("button");
    botao.type = "button";
    botao.classList.add("botao");
    const ehFavorito = favoritos.includes(pokemon.id);
    botao.textContent = ehFavorito ? "♥ Favorito" : "♡ Favoritar";
    botao.classList.toggle("favorito", ehFavorito);
    botao.addEventListener("click", () => {
      alternarFavorito(pokemon.id);
      aplicarFiltros();
    });
    cartao.appendChild(imagem);
    cartao.appendChild(titulo);
    cartao.appendChild(tipo);
    cartao.appendChild(botao);
    container.appendChild(cartao);
  });
}

// Busca por nome + filtro de favoritos
function aplicarFiltros() {
  const texto = document.querySelector("#busca").value.toLowerCase();
  const soFavoritos = document.querySelector("#soFavoritos").checked;
  const filtrados = listaDePokemons.filter((p) =>
    p.nome.includes(texto) && (!soFavoritos || favoritos.includes(p.id)));
  mostrarCartoes(filtrados);
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarModoEscuro();
  document.querySelector("#busca").addEventListener("input", aplicarFiltros);
  document.querySelector("#soFavoritos").addEventListener("change", aplicarFiltros);
  buscarPokemons();
});
