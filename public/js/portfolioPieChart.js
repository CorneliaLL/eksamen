document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("portfolioGraph");
  if (!canvas) return;

  const portfolioID = canvas.dataset.portfolioid;

  fetch(`/portfolio/${portfolioID}/pie`)
    .then(res => res.json())
    .then(({ labels, data }) => {
      const ctx = document.getElementById("pieChart").getContext("2d");

      new Chart(ctx, {
        type: "pie",
        data: {
          labels: labels,
          datasets: [{
            label: "Stocks in Portfolio",
            data: data,
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
        },
      });
    })
    .catch(err => {
      console.error("Failed to load pie chart:", err);
    });

});







/*const data = JSON.stringify(valueDistribution) 

  new Chart(document.getElementById('pieChart'), {
    type: 'pie',
    data: {
      labels: data.map(d => d.label),
      datasets: [{
        label: "Aktiefordeling",
        data: data.map(d => d.value),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        borderColor: 'blue',
      }]
    },
    options: {
      plugins: {
        legend: { labels: { color: 'white' } }
      }
    }
  });
  */