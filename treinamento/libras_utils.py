import os
import urllib.request

import cv2
import mediapipe as mp
import numpy as np

MODEL_PATH = "hand_landmarker.task"
MODEL_URL = ("https://storage.googleapis.com/mediapipe-models/hand_landmarker/"
             "hand_landmarker/float16/1/hand_landmarker.task")

CONEXOES = [
    (0, 1), (1, 2), (2, 3), (3, 4),
    (0, 5), (5, 6), (6, 7), (7, 8),
    (5, 9), (9, 10), (10, 11), (11, 12),
    (9, 13), (13, 14), (14, 15), (15, 16),
    (13, 17), (0, 17), (17, 18), (18, 19), (19, 20),
]


def criar_landmarker():
    """Modo VIDEO: detecta a mão uma vez e depois ACOMPANHA (mais rápido e estável)."""
    if not os.path.exists(MODEL_PATH):
        print("Baixando modelo do MediaPipe...")
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
    opts = mp.tasks.vision.HandLandmarkerOptions(
        base_options=mp.tasks.BaseOptions(model_asset_path=MODEL_PATH),
        running_mode=mp.tasks.vision.RunningMode.VIDEO,
        num_hands=1,
        min_hand_detection_confidence=0.6,
        min_hand_presence_confidence=0.6,
        min_tracking_confidence=0.6,
    )
    return mp.tasks.vision.HandLandmarker.create_from_options(opts)


def detectar(landmarker, img_bgr, timestamp_ms):
    rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    return landmarker.detect_for_video(mp_img, int(timestamp_ms))


def normalizar(hand_landmarks, lado):
    """Transforma os 21 pontos em 63 números que NÃO dependem de posição, tamanho
    da mão nem de qual mão é. É isso que permite o modelo generalizar."""
    pts = np.array([[p.x, p.y, p.z] for p in hand_landmarks], dtype=np.float32)
    pts -= pts[0]                                   # punho vira a origem
    escala = np.linalg.norm(pts[9, :2]) or 1.0      # punho -> base do dedo médio
    pts /= escala                                   # tamanho da mão vira 1
    if lado == "Left":                              # espelha para parecer sempre a mesma mão
        pts[:, 0] *= -1
    return pts.flatten()


def desenhar(img, hand_landmarks):
    h, w = img.shape[:2]
    px = [(int(p.x * w), int(p.y * h)) for p in hand_landmarks]
    for a, b in CONEXOES:
        cv2.line(img, px[a], px[b], (0, 255, 0), 2)
    for p in px:
        cv2.circle(img, p, 5, (0, 0, 255), -1)
