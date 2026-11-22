// Sinais que aparecem no dicionário. Para incluir um sinal, adicione um item e coloque a mídia em midia/.
const SINAIS_BASE = [
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letra) => ({ palavra: letra, categoria: "Alfabeto", midia: `midia/${letra}.gif` })),
  ...["Olá", "Tchau", "Obrigado"].map((palavra) => ({ palavra, categoria: "Palavras", midia: `midia/${palavra.toLowerCase()}.gif` })),
];

// Sinais da base + os que o próprio usuário cadastrou (RF07)
const todosOsSinais = (usuario) => [
  ...SINAIS_BASE,
  ...usuario.sinais.map((s) => ({ palavra: s.nome, categoria: "Meus sinais", midia: s.foto, personalizado: true })),
];
