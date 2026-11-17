const CHAVE_ESCURO = "modoEscuro";
const CHAVE_FAVORITOS = "favoritos";

function lerFavoritos() {
  return JSON.parse(localStorage.getItem(CHAVE_FAVORITOS)) || [];
}

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

async function buscarLista() {
  const resposta = await fetch(API_URL);
  if (!resposta.ok) { throw new Error("Erro " + resposta.status); }
  const dados = await resposta.json();
  return dados.results.map((item) => ({ nome: item.name, id: Number(item.url.split("/")[6]) }));
}

const DETALHE_URL = "https://pokeapi.co/api/v2/pokemon/";
const NOMES_STATS = {
  "hp": "HP",
  "attack": "Ataque",
  "defense": "Defesa",
  "special-attack": "Ataque Esp.",
  "special-defense": "Defesa Esp.",
  "speed": "Velocidade"
};

let listaDePokemons = [];
const favoritos = lerFavoritos();

function somar(a, b) { return a + b; }
function subtrair(a, b) { return a - b; }
function multiplicar(a, b) { return a * b; }
function dividir(a, b) {
  if (b === 0) { return "divisão por zero"; }
  return a / b;
}

function calcular(a, b, operacao) { return operacao(a, b); }

const somarLista = (valores) => valores.reduce((total, v) => calcular(total, v, somar), 0);
const calcularMedia = (valores) => dividir(somarLista(valores), valores.length);

function preencherSelects() {
  const texto = document.querySelector("#busca").value.toLowerCase();
  const soFavoritos = document.querySelector("#soFavoritos").checked;
  [document.querySelector("#pokemonA"), document.querySelector("#pokemonB")].forEach((select, posicao) => {
    const escolhido = select.value;
    const opcoes = listaDePokemons.filter((p) =>
      String(p.id) === escolhido ||
      (p.nome.includes(texto) && (!soFavoritos || favoritos.includes(p.id))));
    select.textContent = "";
    opcoes.forEach((p) => {
      const opcao = document.createElement("option");
      opcao.value = p.id;
      opcao.textContent = "#" + p.id + " " + p.nome;
      select.appendChild(opcao);
    });
    select.value = escolhido;
    if (!select.value && opcoes.length > 0) {
      select.selectedIndex = Math.min(posicao, opcoes.length - 1);
    }
  });
}

async function buscarDetalhes(id) {
  const resposta = await fetch(DETALHE_URL + id);
  if (!resposta.ok) { throw new Error("Erro " + resposta.status); }
  const p = await resposta.json();
  return {
    nome: p.name,
    imagem: p.sprites.front_default,
    stats: p.stats.map((s) => ({ nome: NOMES_STATS[s.stat.name], valor: s.base_stat }))
  };
}

function criarLinha(textos, tag) {
  const linha = document.createElement("tr");
  textos.forEach((texto) => {
    const celula = document.createElement(tag);
    celula.textContent = texto;
    linha.appendChild(celula);
  });
  return linha;
}

function criarFigura(pokemon) {
  const figura = document.createElement("figure");
  const imagem = document.createElement("img");
  imagem.src = pokemon.imagem;
  imagem.alt = "Imagem do Pokémon " + pokemon.nome;
  const legenda = document.createElement("figcaption");
  legenda.textContent = pokemon.nome;
  figura.appendChild(imagem);
  figura.appendChild(legenda);
  return figura;
}

function mostrarComparacao(a, b) {
  const area = document.querySelector("#areaResultado");
  area.textContent = "";
  area.appendChild(criarFigura(a));
  area.appendChild(criarFigura(b));

  const tabela = document.createElement("table");
  tabela.appendChild(criarLinha(["Atributo", a.nome, b.nome, "Diferença", "Maior"], "th"));
  a.stats.forEach((stat, i) => {
    const valorB = b.stats[i].valor;
    const diferenca = calcular(stat.valor, valorB, subtrair);
    const maior = diferenca > 0 ? a.nome : (diferenca < 0 ? b.nome : "Empate");
    const linha = criarLinha([stat.nome, stat.valor, valorB, diferenca, maior], "td");
    if (diferenca > 0) { linha.children[1].classList.add("vencedor"); }
    if (diferenca < 0) { linha.children[2].classList.add("vencedor"); }
    tabela.appendChild(linha);
  });
  area.appendChild(tabela);

  const totalA = somarLista(a.stats.map((s) => s.valor));
  const totalB = somarLista(b.stats.map((s) => s.valor));
  const vitoriasA = a.stats.filter((s, i) => s.valor > b.stats[i].valor).length;
  const proporcao = calcular(totalA, totalB, dividir);
  const resumo = document.createElement("p");
  resumo.textContent = "Total: " + a.nome + " " + totalA + " x " + totalB + " " + b.nome +
    " | Média de " + a.nome + ": " + calcularMedia(a.stats.map((s) => s.valor)).toFixed(1) +
    " | " + a.nome + " vence em " + vitoriasA + " atributos" +
    " | " + a.nome + " tem " + calcular(proporcao, 100, multiplicar).toFixed(0) + "% do total de " + b.nome + ".";
  area.appendChild(resumo);
}

async function comparar() {
  const status = document.querySelector("#status");
  const idA = document.querySelector("#pokemonA").value;
  const idB = document.querySelector("#pokemonB").value;
  if (!idA || !idB) {
    status.textContent = "Escolha dois Pokémon para comparar.";
    return;
  }
  status.textContent = "Carregando...";
  try {
    const [a, b] = await Promise.all([buscarDetalhes(idA), buscarDetalhes(idB)]);
    mostrarComparacao(a, b);
    status.textContent = "";
  } catch (erro) {
    status.textContent = "Não foi possível comparar. Tente novamente.";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  iniciarModoEscuro();
  const status = document.querySelector("#status");
  status.textContent = "Carregando...";
  try {
    listaDePokemons = await buscarLista();
    status.textContent = "";
    preencherSelects();
  } catch (erro) {
    status.textContent = "Não foi possível carregar a lista de Pokémon.";
  }
  document.querySelector("#busca").addEventListener("input", preencherSelects);
  document.querySelector("#soFavoritos").addEventListener("change", preencherSelects);
  document.querySelector("#botaoComparar").addEventListener("click", comparar);
});
