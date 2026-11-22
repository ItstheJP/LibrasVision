"""Prepara o site: confere o dados.csv, estima a precisão do kNN (o classificador do site)
e copia os arquivos para as pastas certas.

Rode DENTRO da pasta treinamento/:   python 4_exportar_para_o_site.py
"""
import shutil
from pathlib import Path

import pandas as pd
from sklearn.neighbors import KNeighborsClassifier

AQUI = Path(__file__).parent
SITE = AQUI.parent
MINIMO_POR_LETRA = 100

if not (AQUI / "dados.csv").exists():
    raise SystemExit("dados.csv não encontrado. Rode antes: python 1_coletar_dados.py")

df = pd.read_csv(AQUI / "dados.csv", header=None)
df[0] = df[0].astype(str).str.strip().str.upper()
if df.shape[1] != 64 or df.iloc[:, 1:].isna().any().any():
    raise SystemExit(f"dados.csv inválido: esperado letra + 63 números por linha, veio {df.shape[1]} colunas.")

# ---- 1) quantas amostras por letra ----
contagem = df[0].value_counts().sort_index()
print("Amostras por letra:")
print(contagem.rename_axis("letra").to_string(), "\n")
poucas = contagem[contagem < MINIMO_POR_LETRA]
if len(poucas):
    print(f"ATENÇÃO: menos de {MINIMO_POR_LETRA} amostras em: {', '.join(poucas.index)}\n")

# ---- 2) estimativa da precisão do kNN com k=5 (igual ao do site) ----
# As linhas são gravadas em sequência, então testamos com os últimos 20% de cada letra
# (quadros vizinhos são quase iguais; sortear linhas ao acaso daria uma nota inflada).
posicao = df.groupby(0).cumcount()
tamanho = df.groupby(0)[0].transform("size")
teste = posicao >= tamanho * 0.8
X, y = df.drop(columns=0).to_numpy(), df[0].to_numpy()
knn = KNeighborsClassifier(n_neighbors=5).fit(X[~teste], y[~teste])
previsto = knn.predict(X[teste])
acerto = (previsto == y[teste])
print(f"Precisão estimada do kNN: {acerto.mean():.1%} ({teste.sum()} amostras de teste)")
por_letra = pd.Series(acerto, index=y[teste]).groupby(level=0).mean()
fracas = por_letra[por_letra < 0.9]
print("Letras abaixo de 90%:", ", ".join(f"{l} ({v:.0%})" for l, v in fracas.items()) or "nenhuma", "\n")

# ---- 3) copia para o site ----
shutil.copyfile(AQUI / "dados.csv", SITE / "dados" / "amostras.csv")
print("Copiado: dados.csv -> ../dados/amostras.csv")
modelo = AQUI / "hand_landmarker.task"
if modelo.exists():
    (SITE / "modelos").mkdir(exist_ok=True)
    shutil.copyfile(modelo, SITE / "modelos" / "hand_landmarker.task")
    print("Copiado: hand_landmarker.task -> ../modelos/ (o site passa a funcionar offline)")
else:
    print("hand_landmarker.task não encontrado aqui: o site vai baixá-lo da internet na primeira vez.")
