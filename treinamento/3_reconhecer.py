import time
from collections import Counter, deque

import cv2
import joblib

from libras_utils import criar_landmarker, desenhar, detectar, normalizar

LIMIAR = 0.70          # confiança mínima para aceitar a previsão
JANELA = 10            # votação entre os últimos N frames (tira o "tremido")

modelo = joblib.load("modelo_libras.joblib")
historico = deque(maxlen=JANELA)

cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
t0 = time.time()

with criar_landmarker() as lm:
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
            x = normalizar(mao, lado).reshape(1, -1)
            prob = modelo.predict_proba(x)[0]
            i = prob.argmax()
            historico.append(modelo.classes_[i] if prob[i] >= LIMIAR else "?")
        else:
            historico.clear()

        if historico:
            letra, votos = Counter(historico).most_common(1)[0]
            if letra != "?" and votos >= JANELA * 0.6:
                cv2.putText(img, f"Letra: {letra}", (50, 100),
                            cv2.FONT_HERSHEY_SIMPLEX, 3, (0, 255, 0), 5)

        cv2.imshow("Reconhecimento LIBRAS", img)
        if cv2.waitKey(1) & 0xFF == 27:
            break

cap.release()
cv2.destroyAllWindows()
