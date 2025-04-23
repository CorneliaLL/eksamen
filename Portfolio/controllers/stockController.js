const { storeStockData } = require("../services/fetchStockData.js"); //imports function that gets stockdata from alpha vantage
const { Stocks } = require("../models/stockModels.js"); //imports function that gets data from database 

//handles calling api: get stockdata from alpha vantage and saves in database
exports.fetchStock = async (req, res) => {
    const { ticker } = req.params; //gets ticker from URL
    try {
        await storeStockData(ticker); //gets service function to get and save data 
        res.send(`Stock data for ${ticker} is updated`);
    } catch (error) {
        console.error('Cannot fetch stock data:', error);
        res.status(500).send('Cannot fetch stock data'); //error message 
    }
};

//handles visualizing of graph for one stock 
exports.showChart = async (req, res) => {
    const { ticker } = req.params; //gets ticket from URL
    try {
        const { dates, prices } = await stock.getStockData(ticker); //gets dates and prices for stocks from database 
        res.render('stockChart', { ticker, dates, prices }); //sends data for graph 
    } catch (error) {
        console.error('Cannot get stock chart:', error);
        res.status(500).send('Cannot get stock chart'); //error message 
    }
};

//handles visualizing of lists of stocks 
exports.listStocks = async (req, res) => {
    try {
        const stocks = await Stocks.getAllStocks(); //gets all stocks from database
        res.render('stockList', { stocks }); //gets stocks for lists
    } catch (error) {
        console.error('Cannot get stock list:', error);
        res.status(500).send('Cannot get stocks'); //error message
    }
};