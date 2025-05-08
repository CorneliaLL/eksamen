


document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('portfolioGraph').getContext('2d');
  const graphCanvas = document.getElementById('portfolioGraph');

  const portfolioID = graphCanvas.dataset.portfolioid;

  /*const myLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June'],
      datasets: [{
        label: 'Sales',
        data: [65, 59, 80, 81, 56, 55],
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
  }); */



  fetch(`/api/portfolio/${portfolioID}/graph`)
    .then(res => res.json())
    .then(data => {
/*       const datasets = [];
      Object.keys(data).forEach(ticker => {
        console.log(ticker)
        const entries = data[ticker];
        datasets.push({
          label: ticker,
          data: entries.map(e => ({ x: e.date, y: e.price })),
          borderWidth: 2,
          fill: false,
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1
        });
      });

      console.log("create new char") */
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June'],
          datasets: [{
            label: 'Sales',
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







/*document.addEventListener('DOMContentLoaded', () => {
  const graphCanvas = document.getElementById('portfolioGraph');
  const portfolioID = graphCanvas.dataset.portfolioid;

  const ctx = graphCanvas.getContext('2d');

  fetch(`/api/portfolio/${portfolioID}/graph`)
    .then(res => res.json())
    .then(data => {
      const datasets = [];

      console.log(data)

      Object.keys(data).forEach(ticker => {
        const entries = data[ticker];
        datasets.push({
          label: ticker,
          data: entries.map(e => ({ x: e.date, y: e.price })),
          borderWidth: 2,
          borderColor: 'rgba(255, 99, 132, 1)', 
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
});*/



      // ny funktion, som finder dagens dato, summerer prisen på all værdipapirer for gældende dato, og gentager 5 gange
      /*
      //et nyt objekt, som kan plottes ind i chart
      chartdata = [{
      x: 05-05,
      y: 280+280+280},
      {
      x: 05-04,
      y: 200+200+200}] */

 

  



