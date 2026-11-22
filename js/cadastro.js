verificarEndereco();

document.getElementById("form").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const dados = Object.fromEntries(new FormData(evento.target));
  try {
    await cadastrar({ nome: dados.nome, email: dados.email, senha: dados.senha });
    location.href = "boas-vindas.html";
  } catch (erro) {
    document.getElementById("erro").textContent = erro.message;
  }
});
