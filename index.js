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

// Mostra quantos favoritos existem
function mostrarFavoritos() {
  document.querySelector("#contadorFavoritos").textContent = lerFavoritos().length;
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarModoEscuro();
  mostrarFavoritos();
});
