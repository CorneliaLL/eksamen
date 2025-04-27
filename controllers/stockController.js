const { storeStockData } = require("../services/fetchStockData.js"); //imports function that gets stockdata from alpha vantage
const { Stocks } = require("../models/stockModels.js"); //imports function that gets data from database 

//Handles fetching stock data from the API and storing it in our database + assigning its respective portfolioID as well
async function fetchStock(req,res) {
    const { ticker, portfolioID } = req.body;

    try {
        //Gets data from extern API
        const { stockName, latestDate, currency, closePrice, stockType } = await storeStockData(ticker);

        await Stocks.storeStockData(ticker, stockName, latestDate, currency, closePrice, portfolioID, stockType);
        res.status(201).send(`Stock ${stockName} added to portfolio ${portfolioID}`);
    } catch (error) {
        console.error('Error adding stock to portfolio:', error);
        res.status(500).send('Failed to add stock');
    }
}

async function fetchSpecificStock(req, res) {
    const { ticker } = req.params;

    try {
        
        const stock = new Stocks();
        const result = await stock.getStockData(ticker);
  
 
        res.render('stockChart', { 
            ticker: ticker,
            dates: result.dates, 
            prices: result.prices 
        });
    
      } catch (error) {
        console.error('Error getting stock data:', error);
        res.status(500).send('Server error');
      }
}

//handles calling api: get stockdata from alpha vantage and saves in database
async function updateStock(req, res) {
    const { ticker } = req.params; //gets ticker from URL
    try {
        await Stocks.storeStockData(ticker); //gets service function to get and save data 
        res.send(`Stock data for ${ticker} is updated`);
    } catch (error) {
        console.error('Cannot fetch stock data:', error);
        res.status(500).send('Cannot fetch stock data'); //error message 
    }
};

// handles visualizing of graph for one stock 
async function showChart(req, res){
    const { ticker } = req.params; // gets ticker from URL
    res.render('stockChart', { ticker }); //one ticker
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
    fetchStock,
    fetchSpecificStock,
    updateStock,
    showChart,
    listStocks
}