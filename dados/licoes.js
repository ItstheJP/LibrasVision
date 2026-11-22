// Conteúdo das lições. Para criar uma lição nova, basta copiar um item e editar.
//
// Tipos de atividade:
//   teoria            -> mostra a mídia do sinal e um texto
//   reconhecer        -> o aluno faz o sinal na câmera; sem leitor (ou sem câmera) usa a "alternativa"
//   multipla_escolha  -> pergunta com opções
//
// As mídias ficam na pasta midia/ (se o arquivo não existir, aparece um aviso no lugar).

function atividadesDaLetra(letra, outras) {
  return [
    { tipo: "teoria", midia: `midia/${letra}.gif`, texto: `Letra ${letra} do alfabeto manual.` },
    {
      tipo: "reconhecer",
      sinal: letra,
      midia: `midia/${letra}.gif`,
      alternativa: { tipo: "multipla_escolha", pergunta: "Que letra este sinal representa?", midia: `midia/${letra}.gif`, opcoes: [letra, ...outras], correta: letra },
    },
  ];
}

function atividadesDaPalavra(palavra, outras) {
  const arquivo = palavra.toLowerCase();
  return [
    { tipo: "teoria", midia: `midia/${arquivo}.gif`, texto: `Sinal de "${palavra}".` },
    { tipo: "multipla_escolha", pergunta: "Que palavra este sinal representa?", midia: `midia/${arquivo}.gif`, opcoes: [palavra, ...outras], correta: palavra },
  ];
}

const UNIDADES = [
  {
    id: 1, titulo: "Alfabeto Manual",
    licoes: [
      { id: 1, titulo: "Vogais", icone: "🤙", xp: 20,
        atividades: [
          ...atividadesDaLetra("A", ["E", "I"]), ...atividadesDaLetra("E", ["I", "O"]),
          ...atividadesDaLetra("I", ["O", "U"]), ...atividadesDaLetra("O", ["U", "A"]),
          ...atividadesDaLetra("U", ["A", "E"]),
        ] },
      { id: 2, titulo: "Consoantes I", icone: "✋", xp: 20,
        atividades: [
          ...atividadesDaLetra("B", ["C", "D"]), ...atividadesDaLetra("C", ["D", "F"]),
          ...atividadesDaLetra("D", ["F", "B"]),
        ] },
      { id: 3, titulo: "Consoantes II", icone: "👋", xp: 15,
        atividades: [
          ...atividadesDaLetra("L", ["M", "N"]), ...atividadesDaLetra("M", ["N", "L"]),
          ...atividadesDaLetra("N", ["L", "M"]),
        ] },
    ],
  },
  {
    id: 2, titulo: "Saudações",
    licoes: [
      { id: 4, titulo: "Olá e Tchau", icone: "👐", xp: 20,
        atividades: [...atividadesDaPalavra("Olá", ["Tchau", "Obrigado"]), ...atividadesDaPalavra("Tchau", ["Olá", "Obrigado"])] },
    ],
  },
];

const todasAsLicoes = () => UNIDADES.flatMap((u) => u.licoes);
