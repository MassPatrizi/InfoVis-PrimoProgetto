// Larghezza e l'altezza della finestra del browser
const width = window.innerWidth;
const height = window.innerHeight;

// Array per memorizzare gli oggetti Omino
let omini = [];

let ultimaCaratteristicaCliccata = null;

function refreshPage(){
  window.location.reload();
} 

// Funzione per disegnare gli omini
function drawOmino() {
  // Carica i dati dal file JSON
  d3.json('../data/dataset.json').then(function (data) {
    // Calcola il valore massimo di ogni attributo per utilizzarlo nelle scale
    maxValoreTesta = getAttributoMax("testa",data);
    maxValoreBusto = getAttributoMax("busto", data);
    maxValoreBraccia = getAttributoMax("braccia", data);
    maxValoreGambe = getAttributoMax("gambe", data);
    // Itera sui dati
    for (let i = 0; i < data.length; i++) {
      // Crea un nuovo oggetto Omino
      omini[i] = new Omino(i, data[i], data.length,maxValoreTesta, maxValoreBraccia, maxValoreBusto, maxValoreGambe);
      // Aggiungi gli event listener per i vari attributi dell'Omino
      omini[i].testaListener(function () { sortOmino('testa') });
      omini[i].bracciaListener(function () { sortOmino('braccia') });
      omini[i].gambaDListener(function () { sortOmino('gambe') });
      omini[i].gambaSListener(function () { sortOmino('gambe') });
      omini[i].bustoListener(function () { sortOmino('busto') });
    }
  }).catch(function (error) {
    console.log(error);
  });
  
}

// Funzione per calcolare il valore maggiore per un certo attributo nel dataset
function getAttributoMax(attributo, data) {
  let maxValore = -Infinity;
  for (let i = 0; i < data.length; i++) {
    const valore = data[i][attributo];
    if (valore > maxValore) {
      maxValore = valore;
    }
  }
  return maxValore;
}

// Funzione per ordinare gli Omini in base all'attributo selezionato
function sortOmino(key) {
  ultimaCaratteristicaCliccata = key;
  omini.sort((a, b) => (a.attributi[key]) - (b.attributi[key]));
  console.log(omini);
  for (var i = 0; i < omini.length; i++) {
    omini[i].moveTo(i);
  }
}

// Chiama la funzione per disegnare gli Omini
drawOmino();

// Aggiungi un event listener per il clic sullo SVG
d3.select('svg')
  .on('click', function (event) {
    sortOmino(event.key);
  });

// Definisci il tooltip
var tip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)


// Classe per l'oggetto Omino
class Omino {
  constructor(x_pos, attributi, dimensione = 10, maxValoreTesta, maxValoreBraccia, maxValoreBusto, maxValoreGambe) {
    // Calcola la larghezza dell'Omino in base alla dimensione specificata
    this.width = document.body.clientWidth / dimensione - 2;
    this.height = window.innerHeight;
    this.y = this.width;
    this.attributi = attributi;
    this.x_pos = x_pos;

    // Array a cui accedere per colorare gli omini
    const colors = ["red", "blue", "green", "goldenrod", "orange", "purple", "pink", "brown", "gray", "black"];

    var scaleGambe = d3.scaleLinear();
    scaleGambe.domain([0, maxValoreGambe]);
    scaleGambe.range([50, height / 3]);

    var scaleTesta = d3.scaleLinear();
    scaleTesta.domain([0, maxValoreTesta]);
    scaleTesta.range([20, this.width / 2]);

    var scaleBraccia = d3.scaleLinear();
    scaleBraccia.domain([0, maxValoreBraccia]);
    scaleBraccia.range([30, width/7]);

    var scaleBusto = d3.scaleLinear();
    scaleBusto.domain([0, maxValoreBusto]);
    scaleBusto.range([50, height / 3]);

    this.x_offset = x_pos * this.width;

    // Creazione dello SVG per l'Omino
    this.svg = d3.select('body')
      .append('svg')
      .attr('width', this.width)
      .attr('viewBox', '0 0 ' + this.width + ',' + window.innerHeight+ '')
      .attr('transform', 'translate(' + (this.width - document.body.clientWidth / dimensione) + ')')
      .attr('id', x_pos)

    this.svg.on("mousemove", function (event) {
      var mouseX = event.clientX;
      var mouseY = event.clientY;
      tip.style("left", (mouseX + 10) + "px")
        .style("top", (mouseY + 100) + "px")
      
    })
    .on("mouseover", (event, d) => {
      var mouseX = event.clientX;
      var mouseY = event.clientY;
      tip.style("opacity", 1)
        .html("Valori caratteristiche" + 
          "<br/><span style='color:red'>Omino #" + (x_pos +1) + "</span>" +
          "<br/> <b/>" + (ultimaCaratteristicaCliccata === 'testa' ? "<span style='color:green'>" : "") + "Testa: " + attributi.testa + (ultimaCaratteristicaCliccata === 'testa' ? "</span>" : "") +
          "<br/> " + (ultimaCaratteristicaCliccata === 'braccia' ? "<span style='color:green'>" : "") + "Braccia: " + attributi.braccia + (ultimaCaratteristicaCliccata === 'braccia' ? "</span>" : "") +
          "<br/> " + (ultimaCaratteristicaCliccata === 'busto' ? "<span style='color:green'>" : "") + "Busto: " + attributi.busto + (ultimaCaratteristicaCliccata === 'busto' ? "</span>" : "") +
          "<br/> " + (ultimaCaratteristicaCliccata === 'gambe' ? "<span style='color:green'>" : "") + "Gambe: " + attributi.gambe + (ultimaCaratteristicaCliccata === 'gambe' ? "</span>" : ""))
        .style("left", mouseX + this.width / 2 + "px")
        .style("top", (mouseY + 50) + "px");
    })
    .on("mouseout", (event, d) => {
      tip.style("opacity", 0);
    });
    

    // Disegno della testa dell'Omino
    this.testa = this.svg.append('g');
    this.testa.append('circle')
      .attr("fill", colors[x_pos])
      .attr("cx", this.width / 2)
      .attr("cy", this.y)
      .attr("r", scaleTesta(attributi.testa))

    this.testa.append('text') // Aggiungi un elemento di testo
      .attr("fill", "white")
      .attr("x", this.width / 2) 
      .attr("y", this.y)
      .attr("text-anchor", "middle") // Ancora del testo al centro del cerchio
      .text(x_pos + 1);

    // Disegno del busto dell'Omino
    this.busto = this.svg.append('g');
    this.busto.append('line')
      .style("stroke", colors[x_pos])
      .style("stroke-width", 6)
      .style("stroke-linecap", "square")
      .attr("x1", this.width / 2)
      .attr("y1", this.y + scaleTesta(attributi.testa))
      .attr("x2", this.width / 2)
      .attr("y2", this.y + scaleTesta(attributi.testa) / 2 + scaleBusto(attributi.busto))

    // Disegno delle braccia dell'Omino
    this.braccia = this.svg.append('g');
    this.braccia.append('line')
      .style("stroke", colors[x_pos])
      .style("stroke-width", 5)
      .attr("x1", this.width / 2 - scaleBraccia(attributi.braccia) / 2)
      .attr("y1", this.y + scaleTesta(attributi.testa) + 2)
      .attr("x2", this.width / 2 + scaleBraccia(attributi.braccia) / 2)
      .attr("y2", this.y + scaleTesta(attributi.testa) + 2)

    // Disegno della gamba sinistra dell'Omino
    this.gambaS = this.svg.append('g');
    this.gambaS.append("line")
      .style("stroke", colors[x_pos])
      .style("stroke-width", 5)
      .attr("x1", this.width / 2 - this.width / 4)
      .attr("y1", this.y + scaleTesta(attributi.testa) + scaleBusto(attributi.busto) + scaleGambe(attributi.gambe))
      .attr("x2", this.width / 2)
      .attr("y2", this.y + scaleTesta(attributi.testa) / 2 + scaleBusto(attributi.busto) - 2)
      

    // Disegno della gamba destra dell'Omino
    this.gambaD = this.svg.append('g');
    this.gambaD.append("line")
      .style("stroke", colors[x_pos])
      .style("stroke-width", 5)
      .attr("x1", this.width / 2 + this.width / 4)
      .attr("y1", this.y + scaleTesta(attributi.testa) + scaleBusto(attributi.busto) + scaleGambe(attributi.gambe))
      .attr("x2", this.width / 2)
      .attr("y2", this.y + scaleTesta(attributi.testa) / 2 + scaleBusto(attributi.busto) - 2)

    // Aggiungi i listener per i vari componenti dell'Omino
    // Quando viene fatto clic su una parte, viene chiamata la funzione corrispondente
    this.testaListener(function () { sortOmino('testa') });
    this.bracciaListener(function () { sortOmino('braccia') });
    this.gambaDListener(function () { sortOmino('gambe') });
    this.gambaSListener(function () { sortOmino('gambe') });
    this.bustoListener(function () { sortOmino('busto') });
  }

  
  // Definizione delle funzioni di ascolto per le parti dell'Omino
  // Quando viene chiamata una funzione di ascolto, viene chiamata la funzione passata come parametro
  testaListener(func) {
    this.testa.on('click', func)
  }

  bustoListener(func) {
    this.busto.on('click', func);
  }

  bracciaListener(func) {
    this.braccia.on('click', func);
  }

  gambaDListener(func) {
    this.gambaD.on('click', func);
  }

  gambaSListener(func) {
    this.gambaS.on('click', func);
  }


  // Muovi l'Omino alla posizione specificata
  // duration specifica la durata dell'animazione in millisecondi (imposta a 500 se non viene specificata)
  moveTo(x) {
    let x1 = x * this.width - this.x_offset;

    let delay_duration = Math.floor(Math.random() * 500);
    let move_duration = 1000;

    setTimeout(() => {
      this.svg
        .transition()
        .delay(10)
        .duration(move_duration)
        .attr('transform', 'translate(' + x1 + ')')
        .on('end', () => {
          this.x_pos = x
        });
    }, delay_duration);
  }
}
