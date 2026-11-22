import { criarDetector } from "./reconhecimento/detector.js";

const TAMANHO = 63;
const MINIMO_POR_LETRA = 100;
const ICONES = { ok: "✅", aviso: "⚠️", erro: "❌" };

function mostrar(estado, titulo, detalhe = "") {
  document.getElementById("resultados").insertAdjacentHTML("beforeend",
    `<div class="cartao"><strong>${ICONES[estado]} ${titulo}</strong><p class="status" style="margin:4px 0 0">${detalhe}</p></div>`);
}

async function existe(url) {
  try { return (await fetch(url, { method: "HEAD" })).ok; } catch { return false; }
}

function verificarEndereco() {
  if (!window.isSecureContext) {
    return mostrar("erro", "Endereço", `${location.host} não é seguro: o login e a câmera não funcionam. Use http://localhost:8000`);
  }
  if (location.protocol === "file:") {
    return mostrar("erro", "Endereço", "Aberto por arquivo. Use http://localhost:8000 (rode: python -m http.server 8000).");
  }
  mostrar("ok", "Endereço", location.origin);
}

function verificarArmazenamento() {
  try {
    localStorage.setItem("libras:teste", "1");
    const lido = localStorage.getItem("libras:teste");
    localStorage.removeItem("libras:teste");
    if (lido !== "1") throw new Error("não leu o que gravou");
    mostrar("ok", "Armazenamento do navegador", "Login e progresso podem ser salvos.");
  } catch (erro) {
    mostrar("erro", "Armazenamento do navegador", "Bloqueado: " + erro.message + ". Saia do modo anônimo ou libere o armazenamento do site.");
  }
}

// Letras que as lições pedem na câmera
function letrasDasLicoes() {
  const letras = UNIDADES.flatMap((u) => u.licoes).flatMap((l) => l.atividades)
    .filter((a) => a.tipo === "reconhecer").map((a) => a.sinal);
  return [...new Set(letras)];
}

async function verificarAmostras() {
  const resposta = await fetch("dados/amostras.csv").catch(() => null);
  if (!resposta?.ok) {
    return mostrar("erro", "Amostras (dados/amostras.csv)", "Não encontrado. Rode treinamento/4_exportar_para_o_site.py ou copie o dados.csv para dados/amostras.csv.");
  }
  const linhas = (await resposta.text()).split(/\r?\n/).filter(Boolean).map((l) => l.split(","));
  const invalidas = linhas.filter((l) => l.length !== TAMANHO + 1 || l.slice(1).some((v) => Number.isNaN(Number(v))));
  if (invalidas.length) {
    return mostrar("erro", "Amostras (dados/amostras.csv)", `${invalidas.length} linha(s) fora do formato (esperado: letra + 63 números).`);
  }

  const contagem = {};
  linhas.forEach((l) => (contagem[l[0].trim().toUpperCase()] = (contagem[l[0].trim().toUpperCase()] || 0) + 1));
  const resumo = Object.entries(contagem).sort().map(([l, n]) => `${l}: ${n}`).join(" • ");
  const faltando = letrasDasLicoes().filter((l) => !contagem[l]);
  const poucas = Object.entries(contagem).filter(([, n]) => n < MINIMO_POR_LETRA).map(([l]) => l);

  if (faltando.length) {
    mostrar("erro", "Amostras (dados/amostras.csv)", `Sem amostras das letras usadas nas lições: ${faltando.join(", ")}. Total: ${resumo}`);
  } else if (poucas.length) {
    mostrar("aviso", `Amostras (${linhas.length})`, `Poucas amostras (menos de ${MINIMO_POR_LETRA}) em: ${poucas.join(", ")}. ${resumo}`);
  } else {
    mostrar("ok", `Amostras (${linhas.length})`, resumo);
  }
}

async function verificarModeloEDetector() {
  const local = await existe("modelos/hand_landmarker.task");
  mostrar(local ? "ok" : "aviso", "Modelo de mãos (modelos/hand_landmarker.task)",
    local ? "Encontrado: funciona sem internet." : "Não encontrado: será baixado da internet na primeira vez. Copie o arquivo para funcionar offline.");
  try {
    (await criarDetector()).close();
    mostrar("ok", "Detector de mãos (MediaPipe)", "Carregou normalmente.");
  } catch (erro) {
    mostrar("erro", "Detector de mãos (MediaPipe)", erro.message);
  }
}

async function verificarCamera() {
  try {
    const fluxo = await navigator.mediaDevices.getUserMedia({ video: true });
    const { width, height } = fluxo.getVideoTracks()[0].getSettings();
    fluxo.getTracks().forEach((faixa) => faixa.stop());
    mostrar("ok", "Câmera", `Funcionando (${width}×${height}).`);
  } catch (erro) {
    const motivo = erro.name === "NotAllowedError" ? "Permissão negada: libere a câmera no navegador."
      : erro.name === "NotFoundError" ? "Nenhuma câmera encontrada." : erro.message;
    mostrar("erro", "Câmera", motivo);
  }
}

async function verificarMidias() {
  const lista = new Set();
  UNIDADES.flatMap((u) => u.licoes).flatMap((l) => l.atividades).forEach((a) => {
    if (a.midia) lista.add(a.midia);
    if (a.alternativa?.midia) lista.add(a.alternativa.midia);
  });
  SINAIS_BASE.forEach((s) => lista.add(s.midia));

  const faltando = [];
  for (const arquivo of lista) if (!(await existe(arquivo))) faltando.push(arquivo);
  const achadas = lista.size - faltando.length;
  const detalhe = faltando.length ? `Faltam ${faltando.length}: ${faltando.slice(0, 8).join(", ")}${faltando.length > 8 ? "..." : ""}` : "Todas as mídias existem.";
  mostrar(faltando.length ? "aviso" : "ok", `Mídias dos sinais (${achadas} de ${lista.size})`, detalhe);
}

verificarEndereco();
verificarArmazenamento();
await verificarAmostras();
await verificarModeloEDetector();
await verificarCamera();
await verificarMidias();
