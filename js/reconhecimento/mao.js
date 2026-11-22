// Funções puras sobre os 21 pontos (landmarks) da mão.

// Ligações entre os pontos, para desenhar o "esqueleto" da mão
const CONEXOES = [
  [0, 1], [1, 2], [2, 3], [3, 4],        // polegar
  [0, 5], [5, 6], [6, 7], [7, 8],        // indicador
  [5, 9], [9, 10], [10, 11], [11, 12],   // médio
  [9, 13], [13, 14], [14, 15], [15, 16], // anelar
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20], // mínimo e base
];

// Transforma os 21 pontos em 63 números que não dependem de posição, tamanho da mão
// nem de qual mão é. TEM que ser idêntico à função normalizar() do Python (libras_utils.py),
// senão o dados.csv treinado no Python não serve para o site.
export function normalizar(pontos, lado) {
  const origem = pontos[0];
  const base = pontos.map((p) => [p.x - origem.x, p.y - origem.y, p.z - origem.z]);
  const escala = Math.hypot(base[9][0], base[9][1]) || 1; // punho -> base do dedo médio
  const vetor = new Float32Array(63);
  base.forEach((p, i) => {
    vetor[i * 3] = (p[0] / escala) * (lado === "Left" ? -1 : 1); // espelha a mão esquerda
    vetor[i * 3 + 1] = p[1] / escala;
    vetor[i * 3 + 2] = p[2] / escala;
  });
  return vetor;
}

export function desenhar(ctx, pontos, largura, altura) {
  const px = pontos.map((p) => [p.x * largura, p.y * altura]);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#00FF00";
  for (const [a, b] of CONEXOES) {
    ctx.beginPath();
    ctx.moveTo(...px[a]);
    ctx.lineTo(...px[b]);
    ctx.stroke();
  }
  ctx.fillStyle = "#FF0000";
  for (const [x, y] of px) {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
  }
}
