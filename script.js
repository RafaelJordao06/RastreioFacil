document
  .getElementById("codigo")
  .addEventListener("keypress", function (evento) {
    if (evento.key === "Enter") {
      performSearch();
    }
  });

// Carregar histórico do localStorage
window.onload = function () {
  loadSearchHistory();
};

function performSearch() {
  var inputCodigo = document.getElementById("codigo");
  // Obter o valor do campo de entrada
  var trackingCode = document.getElementById("codigo").value;

  // Validação do código de rastreio
  if (!validarCodigoRastreio(trackingCode)) {
    alert("Código de rastreio inválido.");
    inputCodigo.value = ""; // Limpar o campo de input
    return; // Encerrar a função se o código for inválido
  }
  trackingCode = trackingCode.replace(/\s+/g, "").toUpperCase();

  document.getElementById("loadingScreen").style.display = "flex";
  //console.log("Enviei a requisicao");
  fetch("https://api-rastreio-pce1.onrender.com/track/" + trackingCode, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      processarEventos(data.eventos);
      //console.log(data);
      document.getElementById("loadingScreen").style.display = "none";
    })
    .catch((error) => {
      console.error("Erro ao rastrear:", error);
      document.getElementById("loadingScreen").style.display = "none";
    });

  console.log("Search performed:", trackingCode);
  saveSearchToHistory(trackingCode);
}

function processarEventos(eventos) {
  var container = document.getElementById("eventos-container");
  container.innerHTML = ""; // Limpa o conteúdo anterior
  if (eventos.length > 0) {
    eventos.forEach(function (evento) {
      container.innerHTML += criarHtmlEvento(evento);
    });
  } else {
    return (container.innerHTML += `
    <div class="tracking-status-container">
      <p class="tracking-status-title">Nenhum evento encontrado com esse código de rastreio</p>
    </div>
  `);
  }
}

function criarHtmlEvento(evento) {
  return `
    <div class="tracking-status-container">
      <p class="tracking-status-title">${evento.status}</p>
      <div class="status-information">
        <img class="icon" src="/img/${selecionarIcon(
          evento.status
        )}" alt="titulo">
        <div class="tracking-details">
          <div class="time">
            <span class="data">${evento.data}</span>
            <span class="hora">${evento.hora}</span>
          </div>
          <p class="status-description">
            ${evento.local}
          </p>
        </div>
      </div>
    </div>
  `;
}

function selecionarIcon($status) {
  $mapeamentoIcones = {
    "Objeto entregue ao destinatário": "certo.svg",
    "Objeto saiu para entrega ao destinatário": "entregadorMoto.svg",
    "A entrega não pode ser efetuada - carteiro não atendido":
      "entregadorNaoRecebido.svg",
    "Objeto encaminhado": "caminhao.svg",
    "Objeto recebido pelos Correios do Brasil": "bandeira.svg",
    "Objeto postado": "entregador.svg",
    "Fiscalização aduaneira concluída - aguardando pagamento": "carteira.svg",
    "Pagamento confirmado": "pagamentoConfirmado.svg",
    "Solicitação de revisão do tributo": "solicitacaoTributario.svg",
    "Revisão de tributos solicitada pelo cliente": "revisaotributos.svg",
  };

  return $mapeamentoIcones[$status] || "caminhao.svg";
}

function validarCodigoRastreio(trackingCode) {
  // Remover espaços e converter para maiúsculas
  trackingCode = trackingCode.replace(/\s+/g, "").toUpperCase();

  // Padrões comuns
  const padraoCorreiosBR = /^[A-Z]{2}\d{9}[A-Z]{2}$/; // Ex: AA123456789BR
  const padraoUSPS = /^(\d{20,22}|[A-Z]{2}\d{9}[A-Z]{2})$/; // Ex: 9400110200830500000000 ou EA123456789US
  const padraoFedEx = /^(\d{12}|\d{15}|\d{20})$/; // Ex: 123456789012
  const padraoDHL = /^\d{10,11}$/; // Ex: 1234567890

  return (
    padraoCorreiosBR.test(trackingCode) ||
    padraoUSPS.test(trackingCode) ||
    padraoFedEx.test(trackingCode) ||
    padraoDHL.test(trackingCode)
  );
}

function loadSearchHistory() {
  var historyContainer = document.getElementById("tracking-history-container");
  historyContainer.innerHTML = ""; // Limpar conteúdo anterior

  var searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

  searchHistory.forEach(function (searchItem) {
    var historyItem = criarHtmlSearchHistoryItem(searchItem);
    // Usar innerHTML para adicionar HTML à div, não appendChild
    historyContainer.innerHTML += historyItem;
  });
}

function criarHtmlSearchHistoryItem(searchItem) {
  return `
    <div class="tracking-history-item" onclick="selecionarHistorico('${searchItem}')">
      <div class="history-item-content">
        <p>${searchItem}</p>
      </div>
    </div>
  `;
}

function selecionarHistorico(codigo) {
  // Lógica para lidar com a seleção do histórico (por exemplo, realizar a busca)
  document.getElementById("codigo").value = codigo;
  performSearch();
}

function saveSearchToHistory(searchItem) {
  var searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

  // Verificar se o código já está no histórico
  if (searchHistory.indexOf(searchItem) === -1) {
    searchHistory.push(searchItem);

    // Limitar o histórico a um número específico de itens, se necessário
    if (searchHistory.length > 5) {
      searchHistory.shift();
    }

    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    loadSearchHistory(); // Atualizar a exibição do histórico
  }
}

function clearSearchHistory() {
  localStorage.removeItem("searchHistory");
  loadSearchHistory(); // Atualizar a exibição do histórico (será vazia após a limpeza)
}
