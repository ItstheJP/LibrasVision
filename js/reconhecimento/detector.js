// Cria o detector de mãos do MediaPipe (RF02). Roda no navegador, sem servidor.
import { FilesetResolver, HandLandmarker } from "../../vendor/mediapipe/vision_bundle.mjs";

const MODELO_LOCAL = "modelos/hand_landmarker.task";
const MODELO_ONLINE =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export async function criarDetector() {
  // Se o modelo estiver na pasta modelos/, funciona offline; senão baixa da internet
  const temLocal = (await fetch(MODELO_LOCAL, { method: "HEAD" })).ok;
  const arquivos = await FilesetResolver.forVisionTasks("vendor/mediapipe/wasm");

  try {
    return await HandLandmarker.createFromOptions(arquivos, {
      baseOptions: { modelAssetPath: temLocal ? MODELO_LOCAL : MODELO_ONLINE },
      runningMode: "VIDEO",
      numHands: 1,
      // mesmos valores usados na coleta de dados em Python
      minHandDetectionConfidence: 0.6,
      minHandPresenceConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });
  } catch (erro) {
    throw new Error("O modelo de mãos não carregou. Copie hand_landmarker.task para a pasta modelos/ " +
      "ou conecte à internet. (" + erro.message + ")");
  }
}
