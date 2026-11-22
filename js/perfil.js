exigirLogin((usuario) => {
  montarMenu(usuario);
  const $ = (id) => document.getElementById(id);

  $("nome").value = usuario.nome;
  $("email").textContent = usuario.email;
  $("qtd-sinais").textContent = usuario.sinais.length;
  $("leitor").checked = usuario.config.leitor;
  $("numeros").innerHTML = `
    <div><strong>🔥 ${DB.sequencia(usuario)}</strong>sequência</div>
    <div><strong>⚡ ${usuario.xp}</strong>XP</div>
    <div><strong>📚 ${usuario.progresso.length}</strong>lições</div>`;

  $("salvar-nome").addEventListener("click", () => {
    const nome = $("nome").value.trim();
    if (!nome) return;
    usuario.nome = nome;
    DB.salvarUsuario(usuario);
    montarMenu(usuario); // atualiza o nome no menu
  });

  $("leitor").addEventListener("change", () => {
    usuario.config.leitor = $("leitor").checked;
    DB.salvarUsuario(usuario);
  });

  $("refazer").addEventListener("click", () => {
    usuario.boasVindas = false;
    DB.salvarUsuario(usuario);
    location.href = "boas-vindas.html";
  });

  $("reiniciar").addEventListener("click", () => {
    if (!confirm("Apagar seu progresso (lições, XP e sequência)? Seus sinais personalizados são mantidos.")) return;
    usuario.progresso = [];
    usuario.dias = [];
    usuario.xp = 0;
    DB.salvarUsuario(usuario);
    location.reload();
  });

  $("excluir").addEventListener("click", () => {
    if (!confirm("Excluir sua conta e todos os seus dados? Isso não pode ser desfeito.")) return;
    DB.gravarUsuarios(DB.lerUsuarios().filter((u) => u.id !== usuario.id));
    sair();
  });
});
