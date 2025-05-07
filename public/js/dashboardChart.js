
//hente data om samlet porteføljens værdi fra database/API og tegne en graf på Dashboard

fetch('/api/portfolio/total-value') //gets data from sever (API endpoint)
//server answers and we translate it to JSON 
  .then(response => response.json())
  .then(data => { //JSON anwser as data

    //list of months (labels on x-axis)
    const labels = data.map(entry => entry.date);
    // labels = ['Jan', 'Feb', 'Mar', ...]

    //list of all total value (y-axis)
    const values = data.map(entry => entry.totalValue);
    // values = [200000, 250000, 230000, ...]

    //canvas element in html with id="totalPortfolioChart"
    const ctx = document.getElementById('totalPortfolioChart').getContext('2d');

    //line graph through Chart.js
    new Chart(ctx, {  //new canvas object on canvas
      type: 'line', //type

      data: {
        labels: labels, //x-axis to show months 

        datasets: [{
          label: 'Total value (DKK)', //dataset name 
          data: values, //y-axis value. Portfolios value each month
          
          borderColor: 'blue', //line color 
          borderWidth: 2 //line width
        }]
      },

      options: {
        //how the graph acts 
        scales: {
          y: {
            beginAtZero: false //does not begin at 0 but the lowest value 
          }
        }
      }
    });
  })

  //error 
  .catch(error => console.error('Error collecting data:', error));
  //error shows in browsers console 