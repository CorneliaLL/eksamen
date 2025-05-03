//stockController controls the flow between users req, service and model. Takes in post and get req from browser. 
//uses services to get data from api, uses models to save and get data from database, sends res to user.

const { fetchStockData } = require("../services/fetchStockData.js"); //imports service that gets stockdata from alpha vantage
const { Stocks } = require("../models/stockModels.js"); //imports stock model (database access)

//Handles fetching stock data from the API and storing it in our database + assigning its respective portfolioID as well
async function handleFetchStock(req,res) {//adds new stock to db
    try { 
        const { ticker, portfolioID } = req.body; //gets ticker and portfolioID from req body (post)
        const stockData = await fetchStockData(ticker); //gets stockData from api 
        const stock = new Stocks (
        null,
        stockData.ticker, //stock ticker
        stockData.latestDate, //date for latest stock - latest dat kan nemt misforståes og date er datoen for datapunktet
        portfolioID, //ID for the portfolio stock 
        stockData.stockName, //stock name
        stockData.stockCurrency, //eks. DKK
        stockData.closePrice, //latest closeprice
        stockData.date, //date for latest stock - latest dat kan nemt misforståes og date er datoen for datapunktet
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
//Gets stock data from our DB 
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

/*// handles stock search 
async function handleStockSearch(req, res) {
    try {
        const { ticker } = req.body;
        if (!ticker) {
            return res.status(400).json({ error: "Ticker is required"});
        }

        //fetch stock data from API 
        const stockData = await fetchStockData(ticker);
        if (!stockData) {
            return res.status(404).json({ error: "Stock not found" });
        }

        res.render("trade", { stockData }); //ejs view with data 
    } catch (error) {
        console.error("Error searching for stock:", error);
        res.status(500).json({ error: "Failed to search stock"});
    }
}*/

//bruges ikke rigtig endnu
async function loadSearchView(req, res) {
    res.render("trade" , {
        stockData: null,
        error: "Stock not found in database",
        success: null
      });
}

//håndterer aktiesøgning fra en ticker - bindeled mellem trade.ejs og db
async function handleStockSearch(req, res) {
  try {
    const { ticker } = req.body; //henter ticker

    if (!ticker) {
      return res.render("trade", {
        stockData: null,
        error: "Ticker is required",
        success: null
      });
    }

    const stockData = await Stocks.findStockByTicker(ticker); //søger i DB

    console.log(stockData)

    if (!stockData) {
      return res.render("trade", {
        stockData: null,
        error: "Stock not found in database",
        success: null
      });
    }

    //sender stockData fra DB til EJS
    res.render("trade", {
      stockData,
      error: null,
      success: null
    });

  } catch (err) {
    console.error("DB fetch failed:", err);
    res.render("trade", {
      stockData: null,
      error: "Internal server error",
      success: null
    });
  }
}

// handles visualizing of graph for one stock 
async function showChart(req, res){
    const { ticker } = req.params; // gets ticker from URL
    res.render('stockChart', { ticker }); //sends ticker to ejs 
};

//handles visualizing of lists of stocks 
async function listStocks(req, res){
    try {
        const stocks = await Stocks.getAllStocks(); //gets all stocks from database

        for (let stock of stocks) {
            const updatedPrice = await fetchStockData(stock.ticker);

            if (updatedPrice && updatedPrice.dailyChange) {
                stock.dailyChange = updatedPrice.dailyChange;
            } else {
                stock.dailyChange = 'Ikke tilgængelig';
            }
        }
        console.log('Stock sample:', stocks[0]);
        res.render('stockList', { stocks }); //gets stocks for lists
    } catch (error) {
        console.error('Cannot get stock list:', error);
        res.status(500).send('Cannot get stocks'); //error message
    }
};




//Måske noget der kan bruges til price history
//handles calling api: get stockdata from alpha vantage and saves in database
/*async function updateStock(req, res) {
    const { ticker } = req.params; //gets ticker from URL
    try {
        const stockData = await fetchStockData(ticker);

        const priceResponse = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=5WEYK0DRXVCFWJPW`);
        const priceData = priceResponse.data['Time Series (Daily)'];

        const dates = Object.keys(priceData);
        const today = dates[0];
        const yesterday = dates[1];

        const todayClose = parseFloat(priceData[today]['4. close']);
        const yesterdayClose = parseFloat(priceData[yesterday]['4. close']);
        const dailyChange = todayClose - yesterdayClose;

        res.send(`Stock data for ${ticker} is updated with ${dailyChange.toFixed(2)}`);
    } catch (error) {
        console.error('Cannot fetch stock data:', error);
        res.status(500).send('Cannot fetch stock data'); //error message 
    }
};
*/


module.exports = {
    handleFetchStock, //post: add new stock
    handleGetStockByTicker, //get specific stock 
    handleStockSearch, //search ticker 
    showChart, //shows side for stock graph 
    listStocks, //shows list for stocks 
    loadSearchView // load the search view before making the post request, can maybe remove later

}