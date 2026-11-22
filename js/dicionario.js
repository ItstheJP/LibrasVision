import { iniciarLeitor } from "./reconhecimento/leitor.js";

const AMOSTRAS_POR_SINAL = 40;
const MINIMO_DE_AMOSTRAS = 20;

exigirLogin((usuario) => {
  montarMenu(usuario);

  const $ = (id) => document.getElementById(id);
  const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  // "Olá" e "ola" devem ser a mesma busca
  const simples = (texto) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // ----- RF08: busca por texto -----
  function listar() {
    const texto = simples($("busca").value.trim());
    const categoria = $("categoria").value;
    const ordem = (s) => (simples(s.palavra) === texto ? 0 : simples(s.palavra).startsWith(texto) ? 1 : 2);

    const sinais = todosOsSinais(usuario)
      .filter((s) => (!categoria || s.categoria === categoria) && simples(s.palavra).includes(texto))
      .sort((a, b) => ordem(a) - ordem(b));

    $("contagem").textContent = sinais.length
      ? `${sinais.length} sinal(is) encontrado(s)`
      : "Nenhum sinal encontrado. Que tal cadastrar o seu?";
    $("grade").innerHTML = sinais.map((s) => `
      <div class="cartao-sinal">
        ${htmlDaMidia(s.midia)}
        <strong>${escapar(s.palavra)}</strong>
        ${s.personalizado ? `<button class="remover" data-nome="${encodeURIComponent(s.palavra)}" title="Remover">🗑️</button>` : ""}
      </div>`).join("");
  }

  $("busca").addEventListener("input", listar);
  $("categoria").addEventListener("change", listar);
  $("grade").addEventListener("click", (evento) => {
    const botao = evento.target.closest(".remover");
    if (!botao) return;
    const nome = decodeURIComponent(botao.dataset.nome);
    if (confirm(`Remover o sinal "${nome}"?`)) {
      DB.removerSinal(usuario, nome);
      listar();
    }
  });

  // ----- RF07: cadastrar um sinal personalizado -----
  let leitor = null;
  let gravando = false;
  let coletadas = [];
  let ultimaAmostra = 0;

  function aoResultado(resultado) {
    // uma amostra a cada ~50 ms, para pegar pequenas variações da mão
    const agora = performance.now();
    if (!gravando || !resultado || agora - ultimaAmostra < 50) return;
    ultimaAmostra = agora;
    coletadas.push(Array.from(resultado.vetor, (v) => Math.round(v * 1e4) / 1e4));
  }

  async function abrirDialogo() {
    $("nome").value = "";
    $("gravar").disabled = true;
    $("estado").textContent = "Carregando a câmera...";
    $("dialogo").showModal();
    try {
      const novoLeitor = await iniciarLeitor({ video: $("video"), canvas: $("tela"), aoResultado });
      if (!$("dialogo").open) return novoLeitor.parar(); // fechou enquanto carregava
      leitor = novoLeitor;
      $("estado").textContent = "Digite o nome, faça o sinal e clique em Gravar.";
      $("gravar").disabled = false;
    } catch (erro) {
      $("estado").textContent = "Não foi possível abrir a câmera: " + erro.message;
    }
  }

  function validarNome(nome) {
    if (!nome) return "Digite o nome do sinal.";
    if (todosOsSinais(usuario).some((s) => simples(s.palavra) === simples(nome))) return "Já existe um sinal com esse nome.";
    return null;
  }

  async function gravar() {
    const nome = $("nome").value.trim();
    const problema = validarNome(nome);
    if (problema) return ($("estado").textContent = problema);

    $("gravar").disabled = true;
    for (let n = 3; n > 0; n--) {
      $("estado").textContent = `Prepare o sinal... ${n}`;
      await esperar(1000);
    }

    coletadas = [];
    gravando = true;
    const inicio = Date.now();
    while ($("dialogo").open && coletadas.length < AMOSTRAS_POR_SINAL && Date.now() - inicio < 8000) {
      $("estado").textContent = `Gravando... ${coletadas.length}/${AMOSTRAS_POR_SINAL} (mexa um pouco a mão)`;
      await esperar(100);
    }
    gravando = false;
    if (!$("dialogo").open) return;

    if (coletadas.length < MINIMO_DE_AMOSTRAS) {
      $("estado").textContent = `Só ${coletadas.length} amostras: mantenha a mão visível e tente de novo.`;
      $("gravar").disabled = false;
      return;
    }
    DB.salvarSinal(usuario, { nome, amostras: coletadas, foto: leitor.foto() });
    $("dialogo").close();
    $("busca").value = nome;
    $("categoria").value = "";
    listar();
  }

  $("novo").addEventListener("click", abrirDialogo);
  $("gravar").addEventListener("click", gravar);
  $("cancelar").addEventListener("click", () => $("dialogo").close());
  $("dialogo").addEventListener("close", () => {
    gravando = false;
    leitor?.parar();
    leitor = null;
  });

  listar();
});
