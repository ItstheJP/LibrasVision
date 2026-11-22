# LibrasVision — protótipo do TCC

Site (HTML + CSS + JavaScript) que ensina Libras com lições e reconhece sinais pela câmera.
Tudo roda no seu computador: o reconhecimento acontece no navegador e os dados ficam no navegador.

## Como rodar
1. Na pasta do projeto: `python -m http.server 8000`
2. Abra **http://localhost:8000** (use exatamente esse endereço)
3. Confira tudo em http://localhost:8000/diagnostico.html e siga o `CHECKLIST.md`

## Pastas
- `treinamento/`  scripts Python: coletar dados, treinar, testar ao vivo e exportar para o site
- `dados/`        conteúdo (lições, sinais, missões) e `amostras.csv` (gerado pelo treinamento)
- `js/`           telas; `js/comum/` (banco, login, menu); `js/reconhecimento/` (câmera, detector, classificador)
- `midia/`        gifs, imagens e vídeos dos sinais
- `modelos/`      `hand_landmarker.task` (opcional, para funcionar offline)
- `vendor/`       MediaPipe Tasks Vision 1.1.1 (npm), já incluído

## Do treinamento ao site
```
cd treinamento
pip install -r requirements.txt
python 1_coletar_dados.py          # grava dados.csv
python 2_treinar.py                # Random Forest (métricas para o TCC)
python 3_reconhecer.py             # teste ao vivo em Python
python 4_exportar_para_o_site.py   # confere, estima o kNN e copia para ../dados e ../modelos
```
O site usa kNN sobre o mesmo `dados.csv` (a normalização em JS é idêntica à do Python).

## Fase 2 — aba Câmera
1. Copie o `dados.csv` gerado pela coleta em Python para `dados/amostras.csv`.
2. (Opcional, para funcionar sem internet) copie o `hand_landmarker.task` para `modelos/`.
   Sem ele, o site baixa o modelo do Google na primeira vez.
3. `vendor/mediapipe/` é o MediaPipe Tasks Vision 1.1.1 (npm), já incluído.

## Fase 3 — aula com câmera
- Cada lição segue: teoria (mídia + texto) -> o aluno faz o sinal na câmera (ou responde a alternativa).
- "Com leitor / sem leitor" é a opção do usuário (cadastro e Perfil). Sem leitor, ou se a câmera falhar,
  a atividade `reconhecer` é trocada pela sua `alternativa` de múltipla escolha.
- Tipos de atividade (RF06) em `js/aula.js`: `teoria`, `reconhecer`, `multipla_escolha`.
  Para criar um tipo novo, escreva uma função de tela e registre-a no objeto `TELAS`.
- Feedback imediato (RF05): o sinal só conta depois de ~12 quadros iguais; 3 sinais errados = perde 1 vida.

## Fase 4 — dicionário e sinais personalizados
- `dados/sinais.js`: sinais do dicionário (alfabeto + palavras). Mídias em `midia/` (ex.: `midia/A.gif`, `midia/olá.gif`).
- Busca por texto sem diferenciar acento ou maiúscula (RF08).
- "Cadastrar meu sinal" (RF07): digite o nome, faça o sinal e grave (~40 amostras em 2 s + uma foto).
  O sinal fica na conta do usuário, aparece no dicionário (categoria "Meus sinais") e é reconhecido na aba Câmera.
  Só funciona para sinais estáticos (sem movimento).

## Fase 5 — jornada de primeiro acesso, missões e perfil
- Cadastro -> `boas-vindas.html` (escolher com/sem leitor; se com leitor, teste da câmera) -> primeira lição.
  Quem ainda não terminou a introdução é levado de volta a ela (`exigirLogin` em `js/comum/sessao.js`).
- `dados/missoes.js`: missões diárias ilustrativas (progresso fixo).
- Perfil: nome, leitor liga/desliga, refazer a introdução, reiniciar progresso, excluir conta.

## Requisitos do TCC
RF01 captura: js/reconhecimento/leitor.js | RF02 landmarks: detector.js | RF03 texto: camera.html
RF04 árvore e %: trilha.html | RF05 feedback: aula.js | RF06 tipos de atividade: aula.js (TELAS)
RF07 sinais personalizados: dicionario.js | RF08 busca: dicionario.js
