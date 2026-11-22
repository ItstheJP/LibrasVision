import { carregarClassificador, criarEstabilizador } from "./reconhecimento/classificador.js";
import { iniciarLeitor } from "./reconhecimento/leitor.js";

const TENTATIVAS_MAXIMAS = 3; // erros de sinal na câmera antes de perder uma vida

exigirLogin((usuario) => {
  const id = Number(new URLSearchParams(location.search).get("id"));
  const licao = todasAsLicoes().find((l) => l.id === id);

  // Bloqueio: lição inexistente ou ainda não liberada volta para a trilha
  if (!licao || DB.estadoDasLicoes(usuario)[id] === "bloqueada") {
    location.replace("trilha.html");
    return;
  }

  const fila = licao.atividades;
  let posicao = 0, vidas = 5, erros = 0;
  let usarCamera = usuario.config.leitor; // "com leitor" ou "sem leitor"
  let aviso = "";                          // mensagem quando a câmera falha
  let leitor = null;                       // câmera + detector (ligados só quando preciso)
  let aoResultado = () => {};              // quem está "ouvindo" a câmera neste momento

  const $ = (nome) => document.getElementById(nome);
  const embaralhar = (lista) => [...lista].sort(() => Math.random() - 0.5);

  // ----- peças comuns -----
  function rodape({ mensagem = "", classe = "", botao, aoClicar, desativado = false, leve = false }) {
    $("rodape").className = "aula__rodape " + classe;
    $("rodape").innerHTML =
      `<strong>${mensagem}</strong><button class="botao ${leve ? "botao--leve" : ""}" ${desativado ? "disabled" : ""}>${botao}</button>`;
    $("rodape").querySelector("button").onclick = aoClicar;
  }

  function errar() {
    vidas--;
    erros++;
    $("vidas").textContent = "❤️ " + vidas;
  }

  function avancar() {
    posicao++;
    mostrar();
  }

  function pararCamera() {
    leitor?.parar();
    leitor = null;
    $("area-camera").hidden = true;
  }

  async function garantirLeitor() {
    if (leitor) return;
    const classificador = await carregarClassificador("dados/amostras.csv");
    leitor = await iniciarLeitor({
      video: $("video"), canvas: $("tela"), classificador,
      aoResultado: (resultado) => aoResultado(resultado),
    });
  }

  // ----- tipos de atividade (RF06): cada um é uma função que desenha a tela -----
  function telaTeoria(a) {
    $("corpo").innerHTML = `${htmlDaMidia(a.midia)}<p class="aula__pergunta">${a.texto}</p>`;
    rodape({ botao: "Continuar", aoClicar: avancar });
  }

  function telaMultiplaEscolha(a) {
    let escolhida = null;
    $("corpo").innerHTML =
      (aviso ? `<p class="status">${escapar(aviso)}</p>` : "") +
      `${htmlDaMidia(a.midia)}<p class="aula__pergunta">${a.pergunta}</p>` +
      embaralhar(a.opcoes).map((o) => `<button class="opcao" data-valor="${o}">${o}</button>`).join("");
    aviso = "";
    rodape({ botao: "Verificar", aoClicar: verificar, desativado: true });

    $("corpo").querySelectorAll(".opcao").forEach((botao) => {
      botao.onclick = () => {
        $("corpo").querySelectorAll(".opcao").forEach((b) => b.classList.remove("escolhida"));
        botao.classList.add("escolhida");
        escolhida = botao.dataset.valor;
        rodape({ botao: "Verificar", aoClicar: verificar });
      };
    });

    function verificar() {
      const acertou = escolhida === a.correta;
      if (!acertou) errar();
      $("corpo").querySelectorAll(".opcao").forEach((b) => {
        b.disabled = true;
        if (b.dataset.valor === a.correta) b.classList.add("certa");
        else if (b.dataset.valor === escolhida) b.classList.add("errada");
      });
      rodape({
        mensagem: acertou ? "Muito bem! ✅" : `Resposta: ${a.correta}`,
        classe: acertou ? "certo" : "errado", botao: "Continuar", aoClicar: avancar,
      });
    }
  }

  // O aluno faz o sinal na câmera e recebe o feedback na hora (RF05)
  async function telaReconhecer(a) {
    $("corpo").innerHTML = `<p class="aula__pergunta">Faça o sinal da letra ${a.sinal}</p>${htmlDaMidia(a.midia)}
      <p class="status" id="vivo">Carregando a câmera...</p><p class="status" id="feedback"></p>`;
    $("area-camera").hidden = false;
    rodape({ botao: "Continuar", desativado: true });

    try {
      await garantirLeitor();
    } catch (erro) {
      // Sem câmera, modelo ou amostras: a lição continua na versão sem leitor
      usarCamera = false;
      aviso = `Não foi possível usar a câmera (${erro.message}). Esta lição segue sem o leitor.`;
      return mostrar();
    }

    const confirmar = criarEstabilizador(12);
    let tentativas = 0, ultimaErrada = null, resolvida = false;
    rodape({ botao: "Não consigo usar a câmera", leve: true, aoClicar: () => { usarCamera = false; mostrar(); } });

    aoResultado = (resultado) => {
      if (resolvida) return;
      const letra = resultado && confirmar(resultado.letra);
      $("vivo").textContent = !resultado ? "Mostre a mão para a câmera"
        : resultado.letra ? `Reconhecendo: ${resultado.letra}` : "Não reconheci este sinal";
      if (!letra) { ultimaErrada = null; return; }

      if (letra === a.sinal) {
        resolvida = true;
        $("feedback").textContent = "";
        rodape({ mensagem: "Muito bem! ✅", classe: "certo", botao: "Continuar", aoClicar: avancar });
      } else if (letra !== ultimaErrada) {
        ultimaErrada = letra;
        tentativas++;
        $("feedback").textContent = `Esse sinal foi lido como ${letra}. Tente de novo (${tentativas}/${TENTATIVAS_MAXIMAS})`;
        if (tentativas === TENTATIVAS_MAXIMAS) {
          resolvida = true;
          errar();
          rodape({ mensagem: `Era a letra ${a.sinal}`, classe: "errado", botao: "Continuar", aoClicar: avancar });
        }
      }
    };
  }

  const TELAS = { teoria: telaTeoria, multipla_escolha: telaMultiplaEscolha, reconhecer: telaReconhecer };

  // ----- andamento da aula -----
  function mostrar() {
    $("barra").style.width = Math.round((posicao / fila.length) * 100) + "%";
    $("vidas").textContent = "❤️ " + vidas;
    aoResultado = () => {};
    $("area-camera").hidden = true;
    if (vidas === 0 || posicao >= fila.length) return fim();

    let atividade = fila[posicao];
    // Sem leitor: a atividade "reconhecer" é trocada pela sua alternativa
    if (atividade.tipo === "reconhecer" && !usarCamera) atividade = atividade.alternativa;
    TELAS[atividade.tipo](atividade);
  }

  function fim() {
    pararCamera();
    if (vidas === 0) {
      $("corpo").innerHTML = `<div class="centro"><div class="emoji">💔</div><h1>Acabaram as vidas</h1><p>Tente de novo, você consegue!</p></div>`;
      rodape({ botao: "Voltar à trilha", aoClicar: () => (location.href = "trilha.html") });
      return;
    }
    const estrelas = erros === 0 ? 3 : erros <= 2 ? 2 : 1;
    const xp = DB.concluirLicao(usuario, id, estrelas); // grava no banco
    $("corpo").innerHTML = `<div class="centro"><div class="emoji">🎉</div><h1>Lição concluída!</h1>
      <p style="font-size:32px">${"⭐".repeat(estrelas)}${"☆".repeat(3 - estrelas)}</p><p>+${xp} XP</p></div>`;
    rodape({ botao: "Voltar à trilha", aoClicar: () => (location.href = "trilha.html") });
  }

  window.addEventListener("pagehide", pararCamera);
  mostrar();
});
