// HTML de uma mídia de sinal (gif, imagem, vídeo mp4 ou foto em base64).
// Se o arquivo não existir, aparece um aviso no lugar.
function htmlDaMidia(arquivo, classe = "") {
  if (!arquivo) return "";
  const tag = arquivo.endsWith(".mp4")
    ? `<video src="${arquivo}" autoplay loop muted></video>`
    : `<img src="${arquivo}" alt="Sinal" onerror="this.parentElement.classList.add('midia--vazia')">`;
  const aviso = arquivo.startsWith("data:") ? "Sem imagem" : "Mídia não encontrada: " + arquivo;
  return `<div class="midia ${classe}">${tag}<span>${aviso}</span></div>`;
}
