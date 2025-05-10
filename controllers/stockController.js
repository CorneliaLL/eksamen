const cron = require('node-cron');
const { fetchStockData } = require("../services/fetchStockData.js"); //imports service that gets stockdata from alpha vantage
const { Stocks } = require("../models/stockModels.js"); //imports stock model (database access)
const { PriceHistory } = require("../models/stockModels.js");

    
//Henter og viser data til graf for en bestemt aktie 
async function handleGetStockByTicker(req, res) {
    const { ticker } = req.params; //Henter ticker fra URL

    try {
        const result = await Stocks.getStockByTicker(ticker); 

        res.render('stockChart', { 
            ticker: ticker,
            dates: result.dates, 
            prices: result.prices 
        });
    
      } catch (error) { //error message
        res.status(500).send('Server error');
      }
}

//Håndterer søgning efter aktie baseret på ticker fra trade-siden
async function handleStockSearch(req, res) {
    const { ticker } = req.body; // Henter ticker fra POST
    const { portfolioID, accountID } = req.params; // Henter fra URL
  
    try {  
      if (!ticker) {
        // Hvis brugeren ikke har indtastet ticker, returnerer den error
        return res.render("trade", {
          stockData: null,
          error: "Ticker is required",
          success: null,
          portfolioID,
          accountID,
        });
      }
  
      // Forsøger at finde aktien i databasen
      let dbStock = await Stocks.findStockByTicker(ticker);
  
      // Hvis aktien ikk findes i DB, henter den fra API
      if (!dbStock) {
        const stockData = await fetchStockData(ticker); // Henter fra API
  
        // Hvis API ikke returner data, vises fejl
        if (!stockData || !stockData.ticker) {
          return res.render("trade", {
            stockData: null,
            error: "Stock not found in API",
            success: null,
            portfolioID,
            accountID,
          });
        }
  
        // Opretter ny aktie instant baseret på API data
        const stock = new Stocks(
          stockData.ticker,
          stockData.latestDate,
          null, // aktien tilføjes i DB uden portfolioID
          stockData.stockName,
          stockData.stockCurrency,
          stockData.closePrice,
          stockData.stockType
        );
    
        await Stocks.storeStock(stock); // Forsøger at gemme ny aktie i DB

        // Henter den gemte aktie fra DB
        dbStock = await Stocks.findStockByTicker(ticker); // hent igen efter gem
      }

      const stockData = dbStock;
      
      // Viser aktie data i trade.ejs
      res.render("trade", {
        stockData,
        error: null,
        success: null,
        portfolioID,
        accountID,
      });
  
      // Viser fejlbesked i bunden af /trade
    } catch (err) {
      console.error("DB fetch failed:", err);
      res.render("trade", {
        stockData: null,
        error: "Internal server error",
        success: null,
        portfolioID,
        accountID,
      });
    }
  }
  

//Viser siden til graf (kun ticker, resten hentes i frontend)
async function showChart(req, res){
    const { ticker } = req.params; // gets ticker from URL
    res.render('stockChart', { ticker }); //sends ticker to ejs 
};


// Funktion til at opdatere pris-historikken for alle aktier i databasen
async function updatePriceHistory() {
  try {
    // Hent alle aktier fra databasen
    const stocks = await Stocks.getAllStocks();

    //Looper igennem hver aktie, henter nyeste data, beregner ændringer og gemmer 
    for (const stock of stocks) {
      const { stockID: stockID, ticker: ticker } = stock;

      const stockData = await fetchStockData(ticker);
      const changes = stockData.timeSeries;

      // Sortér datoer fra nyeste til ældste
      const stockDates = Object.keys(changes)
        .sort((a, b) => new Date(b) - new Date(a));
        console.log("Sorterede datoer:", stockDates.slice(0, 5));

      // Loop igennem aktiedata (undtagen sidste indeks for at kunne sammenligne med foregående dag)
      for (let i = 0; i < stockDates.length - 1; i++) {
        const currentDate = stockDates[i];
        const previousDate = stockDates[i + 1];

        // Udtræk og konverter lukkekurser
        const currentClose = parseFloat(changes[currentDate]['4. close']);
        const previousClose = parseFloat(changes[previousDate]['4. close']);

        // Beregn daglig ændring og procent
        const dailyChange = currentClose - previousClose;
        const dailyChangePercent = parseFloat(dailyChange / previousClose) * 100;

        // Find datoer og priser til år-til-dato sammenligning
        const firstClose = parseFloat(changes[stockDates[stockDates.length - 1]]['4. close']);
  
        // Beregn årlig ændring og procent
        const yearlyChange = currentClose - firstClose;
        const yearlyChangePercent = (yearlyChange / firstClose) * 100;

        // Gem data i pris-historik databasen
        await PriceHistory.storePriceHistory({
          stockID,
          price: currentClose,
          priceDate: currentDate,
          dailyChange: dailyChangePercent.toFixed(2),
          yearlyChange: yearlyChangePercent.toFixed(2),
        });
      
      }
    }
  } catch (err) {
    console.error("Failed to update price history:", err);
  }
}

// Initial opdatering af aktiedata ved serverstart
updatePriceHistory(); 

// Cron-job: opdater daglig ændring hver dag kl. 17:00 (serverens tidszone)
// Format: 'minutter timer dag måned ugedag'
cron.schedule('0 17 * * *', updatePriceHistory);

module.exports = {
    handleGetStockByTicker, //get specific stock 
    handleStockSearch, //search ticker 
    showChart, //shows side for stock graph 
    updatePriceHistory,
}


