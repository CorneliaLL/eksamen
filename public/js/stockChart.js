//gets ticker from ejs (server side)
const ticker = document.getElementById('myChart').dataset.ticker;

fetch(`js/stocks/api/stocks/${ticker}`)
  .then(response => response.json())
  .then(data => {
    const labels = data.map(entry => entry.date); //dates
    const prices = data.map(entry => entry.closePrice); //prices

    const ctx = document.getElementById('myChart').getContext('2d');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `${ticker} Stock Price`,
          data: prices,
          borderColor: 'lightblue',
          backgroundColor: 'rgba(173, 216, 230, 0.5)',
          borderWidth: 2,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: 'white' } }
        },
        scales: {
          x: { ticks: { color: 'white' } },
          y: { ticks: { color: 'white' } }
        }
      }
    });
  })
  .catch(error => console.error('Fejl ved hentning af aktiedata:', error));
