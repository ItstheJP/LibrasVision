// Banco de dados local: tudo fica no localStorage do navegador.
// As telas só usam as funções de DB.* — quando houver servidor, troca-se só este arquivo.

const dataLocal = (data) => data.toLocaleDateString("sv-SE"); // AAAA-MM-DD

// Evita que um texto digitado vire HTML
function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

const DB = {
  lerUsuarios() {
    return JSON.parse(localStorage.getItem("libras:usuarios") || "[]");
  },
  gravarUsuarios(lista) {
    localStorage.setItem("libras:usuarios", JSON.stringify(lista));
  },
  usuarioAtual() {
    const id = localStorage.getItem("libras:sessao");
    const usuario = this.lerUsuarios().find((u) => u.id === id);
    if (usuario) usuario.sinais ??= []; // contas criadas antes dos sinais personalizados
    return usuario || null;
  },
  salvarUsuario(usuario) {
    this.gravarUsuarios(this.lerUsuarios().map((u) => (u.id === usuario.id ? usuario : u)));
  },

  // Sinais personalizados do usuário (RF07): { nome, amostras: [[63 números], ...], foto }
  salvarSinal(usuario, sinal) {
    usuario.sinais.push(sinal);
    this.salvarUsuario(usuario);
  },
  removerSinal(usuario, nome) {
    usuario.sinais = usuario.sinais.filter((s) => s.nome !== nome);
    this.salvarUsuario(usuario);
  },

  // "feita", "atual" ou "bloqueada" para cada lição, na ordem da trilha
  estadoDasLicoes(usuario) {
    const feitas = usuario.progresso.map((p) => p.licao_id);
    const estados = {};
    let achouAtual = false;
    for (const licao of todasAsLicoes()) {
      if (feitas.includes(licao.id)) estados[licao.id] = "feita";
      else if (!achouAtual) { estados[licao.id] = "atual"; achouAtual = true; }
      else estados[licao.id] = "bloqueada";
    }
    return estados;
  },

  // Grava a lição como concluída e devolve o XP ganho (0 se for prática repetida)
  concluirLicao(usuario, licaoId, estrelas) {
    const feita = usuario.progresso.find((p) => p.licao_id === licaoId);
    let xp = 0;
    if (feita) {
      feita.estrelas = Math.max(feita.estrelas, estrelas);
    } else {
      xp = todasAsLicoes().find((l) => l.id === licaoId).xp;
      usuario.progresso.push({ licao_id: licaoId, estrelas, xp, data: new Date().toISOString() });
      usuario.xp += xp;
    }
    const hoje = dataLocal(new Date());
    if (!usuario.dias.includes(hoje)) usuario.dias.push(hoje);
    this.salvarUsuario(usuario);
    return xp;
  },

  // Dias seguidos estudando (conta a partir de hoje, ou de ontem se hoje ainda não estudou)
  sequencia(usuario) {
    const dia = new Date();
    if (!usuario.dias.includes(dataLocal(dia))) dia.setDate(dia.getDate() - 1);
    let total = 0;
    while (usuario.dias.includes(dataLocal(dia))) {
      total++;
      dia.setDate(dia.getDate() - 1);
    }
    return total;
  },
};
