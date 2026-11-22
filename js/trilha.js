exigirLogin((usuario) => {
  montarMenu(usuario);

  const estados = DB.estadoDasLicoes(usuario);
  const licoes = todasAsLicoes();
  const feitas = licoes.filter((l) => estados[l.id] === "feita").length;
  const porcentagem = Math.round((feitas / licoes.length) * 100);

  // RF04: percentual de avanço
  document.getElementById("avanco").innerHTML = `
    <strong>${porcentagem}% concluído</strong> (${feitas} de ${licoes.length} lições)
    <div class="barra" style="margin-top:8px"><div class="barra__preenchida" style="width:${porcentagem}%"></div></div>`;

  document.getElementById("trilha").innerHTML = UNIDADES.map((unidade, i) => {
    const doneNaUnidade = unidade.licoes.filter((l) => estados[l.id] === "feita").length;
    const nos = unidade.licoes.map((licao) => {
      const estado = estados[licao.id];
      const progresso = usuario.progresso.find((p) => p.licao_id === licao.id);
      const estrelas = progresso ? "⭐".repeat(progresso.estrelas) + "☆".repeat(3 - progresso.estrelas) : "";
      return `
        <button class="licao licao--${estado}" data-id="${licao.id}" ${estado === "bloqueada" ? "disabled" : ""}>
          <div class="no">${estado === "bloqueada" ? "🔒" : licao.icone}</div>
          <span>${estrelas}</span>
          <small>${licao.titulo}</small>
        </button>`;
    }).join("");
    return `
      <div class="unidade"><span>Unidade ${i + 1} — ${unidade.titulo}</span><span>${doneNaUnidade}/${unidade.licoes.length}</span></div>
      <div class="caminho">${nos}</div>`;
  }).join("");

  // Janela que abre ao clicar numa lição
  const dialogo = document.getElementById("dialogo");
  document.getElementById("trilha").addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-id]");
    if (!botao) return;
    const licao = licoes.find((l) => l.id === Number(botao.dataset.id));
    document.getElementById("d-icone").textContent = licao.icone;
    document.getElementById("d-titulo").textContent = licao.titulo;
    document.getElementById("d-info").textContent =
      `+${licao.xp} XP • ${usuario.config.leitor ? "com leitor de Libras" : "sem leitor de Libras"}`;
    document.getElementById("d-comecar").href = `aula.html?id=${licao.id}`;
    dialogo.showModal();
  });
  document.getElementById("d-fechar").addEventListener("click", () => dialogo.close());
});
