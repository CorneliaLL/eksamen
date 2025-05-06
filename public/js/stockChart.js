// stockChart.js - viser aktiegraf baseret på stockID

document.addEventListener('DOMContentLoaded', () => {
  const chartElement = document.getElementById('myChart');
  if (!chartElement) return;

  const stockID = chartElement.dataset.stockid;

  // Hent historiske data fra serveren
  fetch(`/api/stocks/id/:${stockID}`)
    .then(response => response.json())
    .then(data => {
      const labels = data.map(entry => entry.date);         // x-akse: datoer
      const prices = data.map(entry => entry.closePrice);   // y-akse: lukkekurser

      const ctx = chartElement.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Stock Price',
            data: prices,
            borderColor: 'lightblue',
            backgroundColor: 'rgba(173, 216, 230, 0.3)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { ticks: { color: 'white' } },
            y: { ticks: { color: 'white' } }
          }
        }
      });
    })
    .catch(error => console.error('Error getting stock data', error));
});
