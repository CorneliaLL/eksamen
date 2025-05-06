//stockChart.js gets stock data and creates chart in the browser 

//gets ticker from canvas attribute 
const ticker = document.getElementById('myChart').dataset.ticker;

//fetch stock data and create chart 
fetch(`/stocks/api/${ticker}`)
  .then(response => response.json()) //translate server answer from json to js object
  .then(data => { //list with objects date and closeprice
    const labels = data.map(entry => entry.date); //dates - x-axis label
    const prices = data.map(entry => entry.closePrice); //closePrice -y-axis values 

    //access to canvas for create chart
    const ctx = document.getElementById('myChart').getContext('2d');

    //creates graph lines - chart.js
    new Chart(ctx, {
      type: 'line', //chart type - a line 
      data: {
        labels: labels, //dates x-axis
        datasets: [{
          label: `${ticker} Stock Price`, //name 
          data: prices, //prices y-axis 
          borderColor: 'lightblue', //line color 
          backgroundColor: 'rgba(173, 216, 230, 0.5)', //bagground under the line 
          borderWidth: 2, //line width
          tension: 0.4 //smooth curve. from 0 = sharp and 1 = completly smooth
        }]
      },
      options: {
        responsive: true, //makes chart responsive 
        maintainAspectRatio: false, //allows graph to fit height and width

        scales: {
          x: { ticks: { color: 'white' } }, //x-axis color text
          y: { ticks: { color: 'white' } } //y-axis color text
        }
      }
    });
  }) //error 
  .catch(error => console.error('Error getting stock data', error));
