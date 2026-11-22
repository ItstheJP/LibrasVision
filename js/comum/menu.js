// Menu lateral das 5 abas (a página <nav id="menu"> é preenchida aqui)
const ABAS = [
  ["trilha", "🗺️", "Aprender"],
  ["camera", "📷", "Câmera"],
  ["dicionario", "📖", "Dicionário"],
  ["missoes", "⚡", "Missões"],
  ["perfil", "👤", "Perfil"],
];

function montarMenu(usuario) {
  let atual = location.pathname.split("/").pop().replace(".html", "");
  if (atual === "aula") atual = "trilha";

  const links = ABAS.map(([pagina, icone, nome]) =>
    `<a href="${pagina}.html" class="${pagina === atual ? "ativo" : ""}"><span>${icone}</span>${nome}</a>`
  ).join("");

  document.getElementById("menu").innerHTML = `
    <div class="menu__logo">🤟 LibrasVision</div>
    ${links}
    <div class="menu__rodape">
      <span>${escapar(usuario.nome)}</span>
      <button class="botao botao--leve" onclick="sair()">Sair</button>
    </div>`;
}
