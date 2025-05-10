document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("pieChart");
    if (!canvas) return; 
    const ctx = canvas.getContext("2d");
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['AAPL', 'MSFT', 'GOOGL', 'AMZN'],
            datasets: [{
                label: 'Portfolio Distribution',
                data: [35, 24, 12, 14], // Percentages
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
                }
            }
            }   
        });    
});



