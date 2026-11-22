exigirLogin((usuario) => {
  montarMenu(usuario);

  document.getElementById("missoes").innerHTML = MISSOES_DIARIAS.map((m) => {
    const feita = m.progresso >= m.meta;
    const porcentagem = Math.round((m.progresso / m.meta) * 100);
    return `
      <div class="cartao missao ${feita ? "missao--feita" : ""}">
        <div class="missao__icone">${m.icone}</div>
        <div class="missao__info">
          <strong>${m.nome}</strong>
          <div class="barra"><div class="barra__preenchida" style="width:${porcentagem}%"></div></div>
          <small>${m.progresso}/${m.meta}${feita ? " — Concluída!" : ""}</small>
        </div>
        <div class="missao__premio">${feita ? "✅" : m.premio}</div>
      </div>`;
  }).join("");
});
