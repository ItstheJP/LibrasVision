import { iniciarLeitor } from "./reconhecimento/leitor.js";

const QUADROS_COM_MAO = 15; // quantos quadros seguidos com mão detectada contam como "funcionou"

exigirLogin((usuario) => {
  const $ = (id) => document.getElementById(id);
  let leitor = null;

  $("titulo").textContent = `Bem-vindo(a), ${usuario.nome.split(" ")[0]}!`;

  function mostrarPasso(numero) {
    [1, 2, 3].forEach((n) => ($("passo" + n).hidden = n !== numero));
  }

  function pararCamera() {
    leitor?.parar();
    leitor = null;
  }

  // Último passo: grava a escolha e marca a introdução como concluída
  function terminar(comLeitor) {
    pararCamera();
    usuario.config.leitor = comLeitor;
    usuario.boasVindas = true;
    DB.salvarUsuario(usuario);
    $("resumo").textContent = comLeitor
      ? "As lições vão usar a câmera para conferir seus sinais."
      : "As lições vão usar perguntas, sem câmera. Você pode mudar isso no Perfil.";
    $("primeira").href = `aula.html?id=${todasAsLicoes()[0].id}`;
    mostrarPasso(3);
  }

  // Passo 2: confere se a câmera e o detector de mãos funcionam neste computador
  async function testarCamera() {
    mostrarPasso(2);
    $("continuar").disabled = true;
    $("estado").textContent = "Carregando a câmera...";
    let quadros = 0;
    let funcionou = false;
    try {
      leitor = await iniciarLeitor({
        video: $("video"), canvas: $("tela"),
        aoResultado: (resultado) => {
          if (funcionou) return;
          quadros = resultado ? quadros + 1 : 0;
          if (quadros >= QUADROS_COM_MAO) {
            funcionou = true;
            $("estado").textContent = "✅ Câmera e detector funcionando!";
            $("continuar").disabled = false;
          } else {
            $("estado").textContent = resultado ? "Mão detectada, continue mostrando..." : "Mostre a mão para a câmera";
          }
        },
      });
      $("estado").textContent = "Mostre a mão para a câmera";
    } catch (erro) {
      $("estado").textContent = "Não foi possível usar a câmera (" + erro.message + "). Você pode seguir sem o leitor.";
    }
  }

  document.querySelectorAll("[data-leitor]").forEach((botao) => {
    botao.addEventListener("click", () => (botao.dataset.leitor === "sim" ? testarCamera() : terminar(false)));
  });
  $("continuar").addEventListener("click", () => terminar(true));
  $("pular").addEventListener("click", () => terminar(false));
  window.addEventListener("pagehide", pararCamera);
});
