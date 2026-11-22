# Checklist de check-up — LibrasVision

## 1. Preparar os dados (Python, pasta `treinamento/`)
- [ ] `pip install -r requirements.txt`
- [ ] `python 1_coletar_dados.py`: gravar cada letra das lições (A E I O U B C D L M N e as que você adicionar), 300+ amostras por letra, variando distância, ângulo e inclinação (e, se possível, outras pessoas e outras luzes)
- [ ] `python 2_treinar.py`: anotar a precisão por letra do Random Forest (vai para o TCC)
- [ ] `python 3_reconhecer.py`: testar ao vivo se as letras saem certas
- [ ] `python 4_exportar_para_o_site.py`: nenhuma letra com menos de 100 amostras; anotar a precisão estimada do kNN; confirmar as mensagens "Copiado..."

## 2. Arquivos no lugar
- [ ] `dados/amostras.csv` existe (copiado pelo passo 4)
- [ ] `modelos/hand_landmarker.task` existe (para funcionar sem internet)
- [ ] `midia/`: um arquivo para cada sinal usado (`A.gif`, `E.gif`... `olá.gif`, `tchau.gif`, `obrigado.gif`)
- [ ] `dados/licoes.js`: letras e títulos das lições conferidos (e validados por alguém fluente em Libras)

## 3. Abrir o site
- [ ] Na pasta do site: `python -m http.server 8000`
- [ ] Abrir **http://localhost:8000** (não por dois cliques no arquivo, nem pelo IP ou 0.0.0.0)
- [ ] `http://localhost:8000/diagnostico.html`: tudo ✅ (o aviso das mídias some quando você incluir os arquivos)

## 4. Fluxo do usuário novo
- [ ] Criar conta → cai na introdução (sem poder pular para a trilha)
- [ ] Escolher "Com leitor" → teste da câmera confirma a mão → "Tudo pronto"
- [ ] Primeira lição: teoria → sinal na câmera → "Muito bem!" → estrelas e XP
- [ ] Errar o sinal 3 vezes: perde 1 vida e mostra a resposta
- [ ] A próxima lição desbloqueia; digitar `aula.html?id=3` antes da hora volta para a trilha
- [ ] Sair e entrar de novo: progresso mantido; senha errada é recusada
- [ ] Uma conta nova "Sem leitor" faz a lição só com perguntas

## 5. Demais abas
- [ ] Câmera: a letra aparece, a confiança varia, o texto reconhecido cresce, Espaço e Limpar funcionam
- [ ] Testar com a mão esquerda e com a direita
- [ ] Dicionário: buscar "ola" encontra "Olá"; filtro por categoria funciona
- [ ] Cadastrar um sinal próprio → aparece em "Meus sinais" → a aba Câmera o reconhece → remover funciona
- [ ] Missões: 4 cartões exibidos (ilustrativas)
- [ ] Perfil: trocar o nome atualiza o menu; liga/desliga o leitor; "Refazer a introdução" funciona

## 6. Antes da apresentação
- [ ] Ensaiar a conta nova do zero (Perfil → "Excluir conta" limpa tudo)
- [ ] Testar no computador e no navegador da apresentação (permissão da câmera liberada)
- [ ] Ter um plano B: o fluxo "Sem leitor" funciona sem câmera
- [ ] Guardar uma cópia da pasta do projeto (inclui `dados/amostras.csv`)
- [ ] TCC: citar as limitações (sinais estáticos; login e dados só no navegador; missões ilustrativas) e as métricas anotadas no passo 1
