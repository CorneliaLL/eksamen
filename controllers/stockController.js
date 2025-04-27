const { storeStockData } = require("../services/fetchStockData.js"); //imports function that gets stockdata from alpha vantage
const { Stocks } = require("../models/stockModels.js"); //imports function that gets data from database 

// Map der kobler ticker til firmanavn
const stockNameMap = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOG': 'Alphabet Inc.',
    'AMZN': 'Amazon.com, Inc.',
    'TSLA': 'Tesla, Inc.'
};

const stockTypeMap = {
    'AAPL': 'Stock',
    'MSFT': 'Stock',
    'GOOG': 'Stock',
    'AMZN': 'Stock',
    'TSLA': 'Stock'
}
async function createStock(req,res) {

}

//handles calling api: get stockdata from alpha vantage and saves in database
async function fetchStock(req, res) {
    const { ticker } = req.params; //gets ticker from URL
    try {
        await storeStockData(ticker); //gets service function to get and save data 
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
    createStock,
    fetchStock,
    showChart,
    listStocks
}