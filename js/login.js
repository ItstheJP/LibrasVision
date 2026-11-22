verificarEndereco();

document.getElementById("form").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const dados = Object.fromEntries(new FormData(evento.target));
  try {
    await entrar(dados.email, dados.senha);
    location.href = "trilha.html";
  } catch (erro) {
    document.getElementById("erro").textContent = erro.message;
  }
});
