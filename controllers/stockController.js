//stockController controls the flow between users req, service and model. Takes in post and get req from browser. 
//uses services to get data from api, uses models to save and get data from database, sends res to user.

const { storeStockData } = require("../services/fetchStockData.js"); //imports service that gets stockdata from alpha vantage
const { Stocks } = require("../models/stockModels.js"); //imports stock model (database access)

//Handles fetching stock data from the API and storing it in our database + assigning its respective portfolioID as well
async function fetchStock(req,res) {//adds new stock to db
    try { 
        const { ticker, portfolioID } = req.body; //gets ticker and portfolioID from req body (post)
        const stockData = await fetchStockData(ticker); //gets stockData from api 
        const stock = new Stocks (
        stockData.ticker, //stock ticker
        stockData.stockName, //stock name
        stockData.closePrice, //latest closeprice
        stockData.date, //date for latest stock - latest dat kan nemt misforståes og date er datoen for datapunktet
        stockData.stockcurrency, //eks. DKK
        stockData. stockType, //type
        portfolioID //ID for the portfolio stock 
        );
        
        await Stocks.storeStock(stock); //saves stock in database 
        
        res.status(201).send('Stock saved'); //sends message 
        } catch (err) { 
         console.error(err); //send erro message
         res.status(500).send('error saving stock');
        }
    }; //forklaring: følger objekt orienteret (pensum), struktureret, data api til stock model til database, controller styrer flow, service henter data og model gemmer data (mvc struktur)

async function fetchSpecificStock(req, res) {
    const { ticker } = req.params; //gets ticker from url

    try {
        const stock = new Stocks();
        const result = await stock.getStockData(ticker); //get stocks data from db
 
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

/*//handles calling api: get stockdata from alpha vantage and saves in database
async function updateStock(req, res) {
    const { ticker } = req.params; //gets ticker from URL
    try {
        await Stocks.storeStockData(ticker); //gets service function to get and save data 
        res.send(`Stock data for ${ticker} is updated`);
    } catch (error) {
        console.error('Cannot fetch stock data:', error);
        res.status(500).send('Cannot fetch stock data'); //error message 
    }
};*/

// handles visualizing of graph for one stock 
async function showChart(req, res){
    const { ticker } = req.params; // gets ticker from URL
    res.render('stockChart', { ticker }); //sends ticker to ejs 
};

//handles visualizing of lists of stocks 
async function listStocks(req, res){
    try {
        const stocks = await Stocks.getAllStocks(); //gets all stocks from database
        res.render('stockList', { stocks }); //gets stocks for lists
    } catch (error) {
        console.error('Cannot get stock list:', error);
        res.status(500).send('Cannot get stocks'); //error message
    }
};

module.exports = {
    fetchStock, //post: add new stock
    fetchSpecificStock, //get specific stock 
    showChart, //shows side for stock graph 
    listStocks //shows list for stocks 
}