// Cadastro, login e proteção das páginas.
// Atenção: isto vale para o protótipo. Quem abre as ferramentas do navegador consegue ver
// os dados; login seguro de verdade precisa de um servidor.

// A senha nunca é guardada: guardamos só o hash dela (com um "sal" aleatório por usuário)
async function hashSenha(senha, sal) {
  const bytes = new TextEncoder().encode(sal + senha);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function cadastrar({ nome, email, senha }) {
  email = email.trim().toLowerCase();
  const usuarios = DB.lerUsuarios();
  if (usuarios.some((u) => u.email === email)) throw new Error("Este e-mail já está cadastrado.");

  const sal = crypto.randomUUID();
  const usuario = {
    id: crypto.randomUUID(), nome: nome.trim(), email, sal, hash: await hashSenha(senha, sal),
    config: { leitor: false }, boasVindas: false, xp: 0, progresso: [], dias: [], sinais: [],
  };
  DB.gravarUsuarios([...usuarios, usuario]);
  localStorage.setItem("libras:sessao", usuario.id);
}

async function entrar(email, senha) {
  const usuario = DB.lerUsuarios().find((u) => u.email === email.trim().toLowerCase());
  if (!usuario || usuario.hash !== (await hashSenha(senha, usuario.sal))) {
    throw new Error("E-mail ou senha incorretos.");
  }
  localStorage.setItem("libras:sessao", usuario.id);
}

function sair() {
  localStorage.removeItem("libras:sessao");
  location.href = "login.html";
}

// O site precisa ser aberto por http://localhost:
// - crypto.subtle / crypto.randomUUID (login) só existem em "contexto seguro" (localhost, https);
// - abrindo o arquivo com dois cliques, as páginas com módulos (introdução, aula, câmera,
//   dicionário) não carregam, e alguns navegadores não compartilham os dados entre páginas.
// Esta função avisa na tela em vez de falhar sem explicar.
function verificarEndereco() {
  const naoServe = !window.isSecureContext || location.protocol === "file:";
  if (!naoServe) return;
  document.getElementById("erro").textContent = location.protocol === "file:"
    ? 'Abra por http://localhost:8000 (rode "python -m http.server 8000" na pasta do site). Aberto por arquivo, a câmera e as lições não funcionam.'
    : `Endereço não suportado (${location.host}). Abra http://localhost:8000`;
  document.querySelector("form button").disabled = true;
}

// Chame no começo de toda página protegida: exigirLogin((usuario) => { ... })
function exigirLogin(aoEntrar) {
  const usuario = DB.usuarioAtual();
  if (!usuario) location.replace("login.html");
  // conta nova: primeiro a introdução (contas antigas não têm este campo e entram direto)
  else if (usuario.boasVindas === false && !location.pathname.endsWith("boas-vindas.html")) location.replace("boas-vindas.html");
  else aoEntrar(usuario);
}
