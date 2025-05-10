document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("portfolioPieChart");
    if (!canvas) return; 
    const ctx = canvas.getContext("2d");

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['AAPL', 'MSFT', 'GOOGL', 'AMZN'],
                datasets: [{
                    label: 'Portfolio Distribution',
                    data: [35, 24, 12, 14], 
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                }   
            });    
        })
   
    



