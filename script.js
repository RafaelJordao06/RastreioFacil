// Event listener para a tecla Enter no campo de código
document
  .getElementById("codigo")
  .addEventListener("keypress", function (evento) {
    if (evento.key === "Enter") {
      performSearch();
    }
  });

// Carregar histórico do localStorage quando a janela é carregada
window.onload = function () {
  loadSearchHistory();
};

// Função principal para realizar a busca
function performSearch() {
  var inputCodigo = document.getElementById("codigo");
  var trackingCode = inputCodigo.value;

  if (!validarCodigoRastreio(trackingCode)) {
    alert("Código de rastreio inválido.");
    inputCodigo.value = "";
    return;
  }

  trackingCode = trackingCode.replace(/\s+/g, "").toUpperCase();

  document.getElementById("loadingScreen").style.display = "flex";

  fetch("http://18.230.126.11:3333/track/"+trackingCode, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      processarEventos(data.eventos);
      document.getElementById("loadingScreen").style.display = "none";
    })
    .catch((error) => {
      console.error("Erro ao rastrear:", error);
      document.getElementById("loadingScreen").style.display = "none";
    });

  console.log("Search performed:", trackingCode);
  saveSearchToHistory(trackingCode);
}

// Processar eventos e exibir na interface
function processarEventos(eventos) {
  var container = document.getElementById("eventos-container");
  container.innerHTML = "";

  if (eventos.length > 0) {
    eventos.forEach(function (evento) {
      container.innerHTML += criarHtmlEvento(evento);
    });
  } else {
    container.innerHTML += `
      <div class="tracking-status-container">
        <p class="tracking-status-title">Nenhum evento encontrado com esse código de rastreio</p>
      </div>`;
  }
}

// Criar HTML para um evento
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
    </div>`;
}

// Selecionar ícone com base no status
function selecionarIcon(status) {
  var mapeamentoIcones = {
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

  return mapeamentoIcones[status] || "caminhao.svg";
}

// Validar código de rastreio
function validarCodigoRastreio(trackingCode) {
  trackingCode = trackingCode.replace(/\s+/g, "").toUpperCase();
  const padraoCorreiosBR = /^[A-Z]{2}\d{9}[A-Z]{2}$/;
  const padraoUSPS = /^(\d{20,22}|[A-Z]{2}\d{9}[A-Z]{2})$/;
  const padraoFedEx = /^(\d{12}|\d{15}|\d{20})$/;
  const padraoDHL = /^\d{10,11}$/;

  return (
    padraoCorreiosBR.test(trackingCode) ||
    padraoUSPS.test(trackingCode) ||
    padraoFedEx.test(trackingCode) ||
    padraoDHL.test(trackingCode)
  );
}

// Carregar histórico de busca do localStorage
function loadSearchHistory() {
  var historyContainer = document.getElementById("tracking-history-container");
  historyContainer.innerHTML = "";

  var historyContainerMobile = document.getElementById(
    "tracking-history-container-mobile"
  );
  historyContainerMobile.innerHTML = "";

  var searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

  searchHistory.forEach(function (searchItem) {
    var historyItem = criarHtmlSearchHistoryItem(searchItem);
    historyContainer.innerHTML += historyItem;
    historyContainerMobile.innerHTML += historyItem;
  });
}

// Criar HTML para um item de histórico de busca
function criarHtmlSearchHistoryItem(searchItem) {
  return `
    <div class="tracking-history-item" onclick="selecionarHistorico('${searchItem}')">
      <div class="history-item-content">
        <p>${searchItem}</p>
        <img src="/img/lupa.svg" alt="Buscar">
      </div>
    </div>`;
}

// Selecionar histórico e fechar a modal se estiver aberta
function selecionarHistorico(codigo) {
  var modal = document.getElementById("myModal");
  if (modal.style.display === "block") {
    modal.style.display = "none";
  }

  document.getElementById("codigo").value = codigo;
  performSearch();
}

// Salvar busca no histórico
function saveSearchToHistory(searchItem) {
  var searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

  if (searchHistory.indexOf(searchItem) === -1) {
    searchHistory.push(searchItem);

    if (searchHistory.length > 5) {
      searchHistory.shift();
    }

    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    loadSearchHistory();
  }
}

// Limpar todo o histórico de busca
function clearSearchHistory() {
  localStorage.removeItem("searchHistory");
  loadSearchHistory();
}

// Configurar eventos para abrir e fechar a modal
var modal = document.getElementById("myModal");
var btn = document.getElementById("myBtn");
var span = document.getElementsByClassName("close")[0];

btn.onclick = function () {
  modal.style.display = "block";
};

span.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
