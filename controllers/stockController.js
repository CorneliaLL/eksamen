//stockController controls the flow between users req, service and model. Takes in post and get req from browser. 
//uses services to get data from api, uses models to save and get data from database, sends res to user.
const cron = require('node-cron');
const { fetchStockData } = require("../services/fetchStockData.js"); //imports service that gets stockdata from alpha vantage
const { Stocks } = require("../models/stockModels.js"); //imports stock model (database access)

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
  try {
    const { ticker } = req.body; //henter ticker

    const {portfolioID, accountID} = req.params

    console.log(portfolioID, accountID)

    if (!ticker) {
      return res.render("trade", {
        stockData: null,
        error: "Ticker is required",
        success: null,
        portfolioID, 
        accountID,
      });
    }

    const dbStock = await Stocks.findStockByTicker(ticker); //søger i DB

    if (!dbStock) {
      return res.render("trade", {
        stockData: null,
        error: "Stock not found in database",
        success: null,
        portfolioID, 
        accountID,
      });
    }

    // Oversætter feltnavne fra PascalCase (DB) til camelCase (frontend)
    const stockData = {
      ticker: dbStock.Ticker,
      stockName: dbStock.StockName,
      closePrice: dbStock.ClosePrice,
      stockCurrency: dbStock.StockCurrency,
      stockType: dbStock.StockType,
      latestDate: dbStock.LatestDate,
      portfolioID: dbStock.PortfolioID,
      priceChange: dbStock.priceChange || null  
    };

    //sender stockData fra DB til EJS
    res.render("trade", {
      stockData,
      error: null,
      success: null,
      portfolioID, 
      accountID,
    });

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

// In-memory objekt der bruges til at gemme daglige ændringer uden at gemme det i en database
const stockChanges = {};

//handles visualizing of lists of stocks 
// Henter aktier fra databasen via model
// Tilføjer 'dailyChange' for hver aktie fra stockChanges-objektet (hvis tilgængelig)
async function listStocks(req, res) {
    try {
        const { portfolioID } = req.params;

        const stocks = await Stocks.getStocksByPortfolioID(portfolioID); // henter alle aktier fra databasen

        // For hver aktie: tilføj dailyChange fra in-memory lager (eller fallback)
        for (let stock of stocks) {
            stock.dailyChange = stockChanges[stock.Ticker] || 'Ikke tilgængelig';
        }
        // Sender listen videre til EJS-skabelonen for visning
        res.render('stockList', { stocks }); // sender til EJS
    } catch (error) {
        console.error('Fejl ved hentning af aktieliste:', error);
        res.status(500).send('Serverfejl');
    }
}


// Funktion: Opdaterer dailyChange for alle aktier én gang om dagen
// Henter alle aktier fra DB
// Bruger fetchStockData() til at hente nyeste data fra Alpha Vantage
// Beregner dailyChange og gemmer det midlertidigt i stockChanges

async function updateDailyChange() {
  try {
    const stocks = await Stocks.getAllStocks(); // Hent aktier fra databasen
    const tickers = [];

    for (const stock of stocks) {
        tickers.push(stock.Ticker); // Tilføjer alle tickers, inkl. dubletter
      }

    for (const ticker of tickers) {
        const stockData = await fetchStockData(ticker); // Hent ny data fra API

        // Hvis vi har gyldig daily chane, gemmer den i memory-objektet
        if (stockData?.dailyChange) {
            stockChanges[ticker] = stockData.dailyChange;
            console.log(`${ticker}: ${stockData.dailyChange}%`);
          }
    }
  } catch (err) {
    console.error("Fejl i opdatering:", err);
  }
}

// Initial opdatering af aktiedata ved serverstart
updateDailyChange();

// Cron-job: opdater daglig ændring hver dag kl. 17:00 (serverens tidszone)
// Format: 'minutter timer dag måned ugedag'
cron.schedule('0 17 * * *', updateDailyChange);

module.exports = {
    handleFetchStock, //post: add new stock
    handleGetStockByTicker, //get specific stock 
    handleStockSearch, //search ticker 
    showChart, //shows side for stock graph 
    listStocks, //shows list for stocks 
    updateDailyChange
}

