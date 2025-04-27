const { sql } = require('../database'); //sql connection from database.js 

class Stocks{
    constructor(stockID, ticker, date, portfolioID, stockName, currency, closePrice, stockType){
        this.stockID = stockID;
        this.ticker = ticker;
        this.date = date;
        this.portfolioID = portfolioID;
        this.stockName = stockName;
        this.currency = currency;
        this.closePrice = closePrice;
        this.stockType = stockType;
    }
    static async storeStockData(ticker, stockName, date, currency, closePrice, portfolioID, stockType){
        await sql.query`
        INSERT INTO Stocks (Ticker, StockName, Date, currency, ClosePrice, PortfolioID, StockType)
        VALUES (${ticker}, ${stockName}, ${date}, ${currency}, ${closePrice}, ${portfolioID}, ${stockType})
    `;
    }

    //gets stockdata for graph for a specific tickerr 
    async getStockData(ticker) {
        const result = await sql.query`
            SELECT Date, ClosePrice FROM Stocks
            WHERE Ticker = ${ticker}
            ORDER BY Date ASC
        `; //gets all dates and closing prices for specific stock ordered by date 
    
        return {
            dates: result.recordset.map(r => r.Date.toISOString().split('T')[0]), //For hver række (r) i dataen: Tag datoen, lav den om til tekst (toISOString()), og tag kun dato-delen før T (fordi en ISO-dato ser ud som "2024-04-20T00:00:00.000Z")
            prices: result.recordset.map(r => r.ClosePrice)  //For hver række (r): Tag lukkeprisen (close price) ud
        };
    }

    //gets all stock for list
    static async getAllStocks() {
        const result = await sql.query`
            SELECT Ticker, Date, ClosePrice FROM Stocks
            ORDER BY Ticker, Date DESC
        `; //gets all stocks from database ordered by ticker and newest date 

        return result.recordset; //returns all stocks as a list
    }

}



class PriceHistory{
    constructor(historyID, stockID, price, date){
        this.historyID = historyID;
        this.stockID = stockID;
        this.price = price;
        this.date = date;
    }
}

module.exports = { 
    Stocks,
    PriceHistory
};