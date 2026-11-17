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

function mostrarFavoritos() {
  document.querySelector("#contadorFavoritos").textContent = lerFavoritos().length;
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarModoEscuro();
  mostrarFavoritos();
});
