import { carregarClassificador, criarEstabilizador } from "./reconhecimento/classificador.js";
import { iniciarLeitor } from "./reconhecimento/leitor.js";

exigirLogin((usuario) => {
  montarMenu(usuario);

  const $ = (id) => document.getElementById(id);
  const confirmar = criarEstabilizador(12);
  let classificador = null;
  let leitor = null;
  let ultimaAdicionada = null; // evita repetir a mesma letra enquanto a mão está parada

  const mostrarStatus = (texto) => ($("status").textContent = texto);

  function mensagemDeErro(erro) {
    if (erro.name === "NotAllowedError") return "Permissão da câmera negada. Libere a câmera no navegador e tente de novo.";
    if (erro.name === "NotFoundError") return "Nenhuma câmera encontrada.";
    if (erro.message.startsWith("Arquivo não encontrado")) {
      return "Copie o dados.csv gerado pela coleta em Python para dados/amostras.csv e recarregue a página.";
    }
    return "Erro: " + erro.message;
  }

  function aoResultado(resultado) {
    const letra = resultado && confirmar(resultado.letra);
    $("letra").textContent = resultado?.letra || "–";
    $("confianca").textContent = resultado ? `confiança ${Math.round(resultado.confianca * 100)}%` : "";
    if (!resultado) mostrarStatus("Mostre a mão para a câmera");
    else mostrarStatus(letra ? "Sinal confirmado" : "Segure o sinal por um instante...");

    // RF03: escreve no texto a letra confirmada
    if (letra && letra !== ultimaAdicionada) {
      $("texto").textContent += letra.length > 1 ? letra + " " : letra; // palavra (sinal personalizado) ganha espaço
      ultimaAdicionada = letra;
    }
    if (!letra) ultimaAdicionada = null;
  }

  async function ligar() {
    $("botao").disabled = true;
    try {
      mostrarStatus("Carregando amostras...");
      classificador ??= await carregarClassificador("dados/amostras.csv", usuario.sinais);
      mostrarStatus("Carregando o detector de mãos e a câmera...");
      leitor = await iniciarLeitor({ video: $("video"), canvas: $("tela"), classificador, aoResultado });
      $("botao").textContent = "Desligar câmera";
      mostrarStatus("Mostre a mão para a câmera");
    } catch (erro) {
      mostrarStatus(mensagemDeErro(erro));
    }
    $("botao").disabled = false;
  }

  function desligar() {
    leitor.parar();
    leitor = null;
    $("botao").textContent = "Ligar câmera";
    $("letra").textContent = "–";
    mostrarStatus("Câmera desligada");
  }

  $("botao").addEventListener("click", () => (leitor ? desligar() : ligar()));
  $("limpar").addEventListener("click", () => ($("texto").textContent = ""));
  $("espaco").addEventListener("click", () => ($("texto").textContent += " "));
  window.addEventListener("pagehide", () => leitor?.parar());
});
