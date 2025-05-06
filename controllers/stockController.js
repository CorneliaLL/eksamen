//stockController controls the flow between users req, service and model. Takes in post and get req from browser. 
//uses services to get data from api, uses models to save and get data from database, sends res to user.
const cron = require('node-cron');
const { fetchStockData } = require("../services/fetchStockData.js"); //imports service that gets stockdata from alpha vantage
const { Stocks } = require("../models/stockModels.js"); //imports stock model (database access)
const { PriceHistory } = require("../models/stockModels.js");
const { Portfolio } = require("../models/portfolioModels.js");

//Handles fetching stock data from the API and storing it in our database. Adds new stock to db from aplha vantage api
async function handleFetchStock(req,res) {//adds new stock to db
    try { 
        const { ticker, portfolioID } = req.body; //gets ticker and portfolioID from req body (post)
        const stockData = await fetchStockData(ticker); //gets stockData from api 
        
        const stock = new Stocks (
        stockData.ticker, //stock ticker
        stockData.latestDate, //date for latest stock - latest dat kan nemt misforståes og date er datoen for datapunktet
        portfolioID, //ID for the portfolio stock 
        stockData.stockName, //stock name
        stockData.stockCurrency, //eks. DKK
        stockData.closePrice, //latest closeprice
        stockData.stockType, //type
        );

        stock.dailyChange = stockData.dailyChange; // dailyChange er i objektet, men bruges kun midlertidigt, så nedenstående 'await' gemmer ikke daily change i databasen

        await Stocks.storeStock(stock); //saves stock in database 
        
        res.status(201).send('Stock saved'); //sends message 
        } catch (err) { 
         console.error(err); //send erro message
         res.status(500).send('error saving stock');
        }
    }; //forklaring: følger objekt orienteret (pensum), struktureret, data api til stock model til database, controller styrer flow, service henter data og model gemmer data (mvc struktur)

    
//Used for our search function in frontend
//Gets specific stock data from our DB for chart view 
async function handleGetStockByTicker(req, res) {
    const { ticker } = req.params; //gets ticker from url
    const result = await Stocks.getStockByTicker(ticker);

    try {
        const stock = new Stocks();
        const result = await Stocks.getStockByTicker(ticker); //get stocks data from db
 
        res.render('stockChart', { 
            ticker: ticker,
            dates: result.dates, 
            prices: result.prices 
        });
    
      } catch (error) { //error message 
        console.error('Error getting stock data:', error);
        res.status(500).send('Server error');
      }
}

//handles stock search by ticker from frontend form 
//håndterer aktiesøgning fra en ticker - bindeled mellem trade.ejs og db
async function handleStockSearch(req, res) {
    const { ticker } = req.body; // Henter ticker fra POST
    const { portfolioID, accountID } = req.params; // Henter fra URL
  
    try {
      console.log(portfolioID, accountID);
  
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
  
      // Søger i DB efter nyeste version af aktier
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
      // Oversætter DB data til PascelCase til camelCase
      const stockData = {
        stockID: dbStock.stockID,
        ticker: dbStock.Ticker,
        stockName: dbStock.StockName,
        closePrice: dbStock.ClosePrice,
        stockCurrency: dbStock.StockCurrency,
        stockType: dbStock.StockType,
        latestDate: dbStock.LatestDate,
        portfolioID: dbStock.PortfolioID,
        priceChange: dbStock.priceChange || null,
      };
      
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
  
//renders chart page for a specific stock 
//handles visualizing of graph for one stock 
async function showChart(req, res){
    const { ticker } = req.params; // gets ticker from URL
    res.render('stockChart', { ticker }); //sends ticker to ejs 
};

// Funktion: Opdaterer dailyChange for alle aktier én gang om dagen
// Henter alle aktier fra DB
// Bruger fetchStockData() til at hente nyeste data fra Alpha Vantage
// Beregner dailyChange og gemmer det midlertidigt i stockChanges

async function updatePriceHistory() {
  try {
    const stocks = await Stocks.getAllStocks(); // Hent aktier fra databasen

    for (const stock of stocks) {
        const { StockID: stockID, Ticker: ticker } = stock;
        const stockData = await fetchStockData(ticker);

        if (!stockID || !stockData || stockData.error) {
            console.warn(`Skipping ${ticker}: missing stockID or fetch error.`);
            continue;
          }

    const { closePrice, latestDate, timeSeries } = stockData;
    const dates = Object.keys(timeSeries);

    const previousDate = dates[1];
    const previousClose = parseFloat(timeSeries[previousDate]['4. close']);
    const dailyChange = ((closePrice - previousClose) / previousClose) * 100;


    let yearlyChange = null;
      if (dates.length > 99) {
        const yearAgoDate = dates[99];
        const yearAgoClose = parseFloat(timeSeries[yearAgoDate]['4. close']);
        yearlyChange = ((closePrice - yearAgoClose) / yearAgoClose) * 100;
      }
    
    await PriceHistory.storePriceHistory({
        stockID,
        price: closePrice,
        priceDate: latestDate,
        dailyChange,
        yearlyChange,
      });

    console.log(`Price history saved for ${ticker}: Daily ${dailyChange.toFixed(2)}%, Yearly ${yearlyChange?.toFixed(2) || 'N/A'}%`);
    }
  } catch (err) {
    console.error("Failed to update price history:", err);
  }
}

async function getStockPriceHistory(req, res) {
  const { stockID } = req.params;

  try {
    const history = await Portfolio.getPriceHistoryByStockID(stockID);
    const formatted = history.map(row => ({
      date: row.date,
      closePrice: row.closePrice
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
}

// Initial opdatering af aktiedata ved serverstart
updatePriceHistory();

// Cron-job: opdater daglig ændring hver dag kl. 17:00 (serverens tidszone)
// Format: 'minutter timer dag måned ugedag'
cron.schedule('0 17 * * *', updatePriceHistory);

module.exports = {
    handleFetchStock, //post: add new stock
    handleGetStockByTicker, //get specific stock 
    handleStockSearch, //search ticker 
    showChart, //shows side for stock graph 
    updatePriceHistory,
    getStockPriceHistory
}

