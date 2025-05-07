// Når hele dokumentet er indlæst, udfør denne funktion
document.addEventListener('DOMContentLoaded', () => {
  // Hent canvas-elementet hvor grafen skal vises
  const graphCanvas = document.getElementById('portfolioGraph');
  // Hent portfolio-ID fra data-attribut på canvas-elementet
  const portfolioID = graphCanvas.dataset.portfolioid;

  // Få 2D-tegningskonteksten fra canvas for at kunne tegne grafen
  const ctx = graphCanvas.getContext('2d');

  // Hent grafdata fra serveren via en API-endpoint
  fetch(`/api/portfolio/${portfolioID}/graph`)
    .then(res => res.json()) // Konverter svaret til JSON
    .then(data => {
      const datasets = []; // Her samles datasæt for hvert ticker-symbol

      console.log(data); // Udskriv data til konsollen til fejlsøgning

      // Gå igennem hver ticker (f.eks. AAPL, MSFT) i det hentede data
      Object.keys(data).forEach(ticker => {
        console.log(ticker, data[ticker]);
        const entries = data[ticker]; // Hent alle datapunkter for den enkelte ticker
        datasets.push({
          label: ticker, // Navn der vises i grafens legend
          data: entries.map(e => ({ x: e.date, y: e.price })), // Omform data til x/y-format
          borderWidth: 2, // Størrelse på linjens kant
          tension: 0.3 // Gør linjen lidt buet (smooth curves)
        });
      });

      // Opret grafen med Chart.js
      new Chart(ctx, {
        type: 'line', // Linjediagram
        data: { datasets }, // Brug det forberedte datasæt
        options: {
          parsing: false, // Vi bruger allerede x/y-objekter direkte
          scales: {
            x: { 
              type: 'time', // X-aksen er tidsbaseret
              time: { unit: 'day' }, // Enhed på x-aksen er "dag"
              ticks: { color: 'white' } // Gør x-akseetiketterne hvide
            },
            y: { 
              ticks: { color: 'white' } // Gør y-akseetiketterne hvide
            }
          }
        }
      });
    });
});
