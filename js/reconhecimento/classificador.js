// Classificador kNN: compara a mão atual com as amostras do dados.csv e vota
// na letra mais parecida entre as K vizinhas mais próximas (RF03).

const TAMANHO = 63; // 21 pontos x (x, y, z)

// Lê o CSV gerado pela coleta em Python (cada linha: letra,v1,...,v63) e soma as amostras
// dos sinais personalizados do usuário (RF07).
export async function carregarClassificador(url, sinaisPersonalizados = []) {
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error(`Arquivo não encontrado: ${url}`);

  const amostras = []; // { letra, valores }
  for (const linha of (await resposta.text()).split(/\r?\n/).filter(Boolean)) {
    const [letra, ...valores] = linha.split(",");
    if (valores.length === TAMANHO) amostras.push({ letra: letra.trim().toUpperCase(), valores: valores.map(Number) });
  }
  for (const sinal of sinaisPersonalizados) {
    for (const valores of sinal.amostras) amostras.push({ letra: sinal.nome, valores });
  }
  if (amostras.length === 0) throw new Error(`Nenhuma amostra válida em ${url}`);

  const rotulos = amostras.map((a) => a.letra);
  const dados = new Float32Array(amostras.length * TAMANHO);
  amostras.forEach((a, i) => dados.set(a.valores, i * TAMANHO));
  return { total: rotulos.length, classificar: (vetor, k = 5) => classificar(dados, rotulos, vetor, k) };
}

function classificar(dados, rotulos, vetor, k) {
  const vizinhos = []; // as k amostras mais próximas: { d, letra }
  for (let i = 0; i < rotulos.length; i++) {
    let d = 0;
    for (let j = 0; j < TAMANHO; j++) {
      const diferenca = dados[i * TAMANHO + j] - vetor[j];
      d += diferenca * diferenca;
    }
    if (vizinhos.length < k || d < vizinhos[vizinhos.length - 1].d) {
      vizinhos.push({ d, letra: rotulos[i] });
      vizinhos.sort((a, b) => a.d - b.d);
      if (vizinhos.length > k) vizinhos.pop();
    }
  }

  const votos = {};
  for (const v of vizinhos) votos[v.letra] = (votos[v.letra] || 0) + 1;
  const [letra, quantidade] = Object.entries(votos).sort((a, b) => b[1] - a[1])[0];
  return { letra, confianca: quantidade / vizinhos.length };
}

// Só confirma a letra depois de ela se repetir por N quadros seguidos (RF05).
// Evita aprovar ou reprovar por causa de um único quadro ruim.
export function criarEstabilizador(quadros = 12) {
  let atual = null;
  let repeticoes = 0;
  return (letra) => {
    repeticoes = letra === atual ? repeticoes + 1 : 1;
    atual = letra;
    return letra && repeticoes >= quadros ? letra : null;
  };
}
