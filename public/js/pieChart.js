document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("pieChart");
    if (!canvas) return; // beskyt mod fejl

    const ctx = canvas.getContext("2d");
    new Chart(ctx, {
        type: 'pie',
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
});



