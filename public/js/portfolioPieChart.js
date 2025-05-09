<canvas id="portfolioPieChart"></canvas>

const ctx = document.getElementById('portfolioPieChart').getContext('2d');
const portfolioPieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['AAPL', 'MSFT', 'GOOGL', 'AMZN'],
        datasets: [{
            label: 'Portfolio Distribution',
            data: [35, 24, 12, 14], // Percentages
            backgroundColor: [
                '#facc15', // AAPL - yellow
                '#3b82f6', // MSFT - blue
                '#10b981', // GOOGL - green
                '#f97316'  // AMZN - orange
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: 'white'
                }
            },
            title: {
                display: true,
                text: 'Fordeling af værdi',
                color: 'white'
            }
        }
    }
});

