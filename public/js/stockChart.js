document.addEventListener('DOMContentLoaded', () => {
  const graphCanvas = document.getElementById('portfolioGraph');
  const portfolioID = graphCanvas.dataset.portfolioid;

  const ctx = graphCanvas.getContext('2d');

  fetch(`/api/portfolio/${portfolioID}/graph`)
    .then(res => res.json())
    .then(data => {
      const datasets = [];

      Object.keys(data).forEach(ticker => {
        const entries = data[ticker];
        datasets.push({
          label: ticker,
          data: entries.map(e => ({ x: e.date, y: e.price })),
          borderWidth: 2,
          tension: 0.3
        });
      });

      new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
          parsing: false, // fordi vi bruger x/y-format
          scales: {
            x: { type: 'time', time: { unit: 'day' }, ticks: { color: 'white' } },
            y: { ticks: { color: 'white' } }
          }
        }
      });
    });
});
