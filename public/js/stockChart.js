//portfolio chart 
document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('portfolioGraph').getContext('2d');
  const graphCanvas = document.getElementById('portfolioGraph');

  const portfolioID = graphCanvas.dataset.portfolioid;

  fetch(`/api/portfolio/${portfolioID}/graph`)
    .then(res => res.json())
    .then(data => {

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June'],
          datasets: [{
            label: 'Total value',
            data: data,
            fill: false,
            borderColor: 'rgba(75, 192, 192, 1)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    });
})