function performSearch() {
  // Obter o valor do campo de entrada

  var trackingCode = document.getElementById("codigo").value;

  trackingCode = trackingCode.replace(/\s+/g, "").toUpperCase();

  // Fazer uma requisição para o servidor Node.js
  fetch(
    `https://api.linketrack.com/track/json?user=rafaeljordao.b@gmail.com&token=ce83913968b30011415902c9b618448302730ee880b610737196574e982363d1&codigo=${trackingCode}`
  )
    .then((response) => response.json())
    .then((data) => {
      processarEventos(data.eventos);
      console.log(data);
    })
    .catch((error) => {
      console.error("Erro ao rastrear:", error);
    });
}

function processarEventos(eventos) {
  var container = document.getElementById("eventos-container");
  container.innerHTML = ""; // Limpa o conteúdo anterior

  eventos.forEach(function (evento) {
    container.innerHTML += criarHtmlEvento(evento);
  });
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

  return $mapeamentoIcones[$status] || "Caminhao.svg";
}
