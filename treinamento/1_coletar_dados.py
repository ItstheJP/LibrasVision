"""Coleta de dados.
Teclas:  a-z = escolhe a letra | ESPAÇO = liga/desliga gravação | ESC = sair
Dica: grave cada letra mexendo a mão (distância, ângulo, inclinação) e, se possível,
com pessoas e iluminações diferentes. Meta: 300+ amostras por letra.
"""
import csv
import os
import time
from collections import Counter

import cv2

from libras_utils import criar_landmarker, desenhar, detectar, normalizar

ARQUIVO = "dados.csv"

contagem = Counter()
if os.path.exists(ARQUIVO):
    with open(ARQUIVO) as f:
        for linha in csv.reader(f):
            contagem[linha[0]] += 1

letra, gravando = None, False
cap = cv2.VideoCapture(0)
t0 = time.time()

with criar_landmarker() as lm, open(ARQUIVO, "a", newline="") as f:
    writer = csv.writer(f)
    while True:
        ok, img = cap.read()
        if not ok:
            break
        img = cv2.flip(img, 1)
        res = detectar(lm, img, (time.time() - t0) * 1000)

        if res.hand_landmarks:
            mao = res.hand_landmarks[0]
            lado = res.handedness[0][0].category_name
            desenhar(img, mao)
            if gravando and letra:
                writer.writerow([letra, *normalizar(mao, lado)])
                contagem[letra] += 1

        status = f"Letra: {letra or '-'} | {'GRAVANDO' if gravando else 'pausado'}"
        cv2.putText(img, status, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1,
                    (0, 0, 255) if gravando else (0, 255, 0), 2)
        resumo = " ".join(f"{k}:{v}" for k, v in sorted(contagem.items()))
        cv2.putText(img, resumo, (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
        cv2.imshow("Coleta", img)

        k = cv2.waitKey(1) & 0xFF
        if k == 27:
            break
        elif k == 32:
            gravando = not gravando
        elif ord("a") <= k <= ord("z"):
            letra, gravando = chr(k).upper(), False

cap.release()
cv2.destroyAllWindows()
