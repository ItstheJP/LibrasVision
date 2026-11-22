// Liga a câmera (RF01), detecta a mão (RF02) e classifica o sinal (RF03).
// Usado pela aba Câmera e, na próxima fase, pelas atividades da aula.
import { criarDetector } from "./detector.js";
import { normalizar, desenhar } from "./mao.js";

const CONFIANCA_MINIMA = 0.6;

// aoResultado recebe { letra, confianca, vetor } a cada quadro, ou null se não há mão.
// Sem classificador (ex.: ao gravar um sinal novo) só devolve o vetor.
export async function iniciarLeitor({ video, canvas, classificador = null, aoResultado }) {
  const detector = await criarDetector();
  video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
  await video.play();

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  let ativo = true;

  function quadro(agora) {
    if (!ativo) return;

    // Desenha o vídeo espelhado no canvas e detecta nele (o mesmo que o cv2.flip do Python)
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    const resultado = detector.detectForVideo(canvas, agora);
    if (resultado.landmarks.length === 0) {
      aoResultado(null);
    } else {
      const pontos = resultado.landmarks[0];
      const lado = resultado.handedness[0][0].categoryName;
      desenhar(ctx, pontos, canvas.width, canvas.height);

      const vetor = normalizar(pontos, lado);
      const { letra, confianca } = classificador ? classificador.classificar(vetor) : { letra: null, confianca: 0 };
      aoResultado({ letra: confianca >= CONFIANCA_MINIMA ? letra : null, confianca, vetor });
    }
    requestAnimationFrame(quadro);
  }
  requestAnimationFrame(quadro);

  return {
    // Foto pequena (sem o esqueleto) para mostrar no dicionário
    foto(largura = 240) {
      const mini = document.createElement("canvas");
      mini.width = largura;
      mini.height = Math.round((largura * video.videoHeight) / video.videoWidth);
      const c = mini.getContext("2d");
      c.scale(-1, 1);
      c.drawImage(video, -mini.width, 0, mini.width, mini.height);
      return mini.toDataURL("image/jpeg", 0.7);
    },
    parar() {
      ativo = false;
      video.srcObject.getTracks().forEach((faixa) => faixa.stop());
      detector.close();
    },
  };
}
