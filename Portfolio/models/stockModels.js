const { sql } = require('../database'); //sql connection from database.js 

class Stock{
    constructor(stockID, portfolioID, stockName, currency, currentPrice, stockType){
        this.stockID = stockID;
        this.portfolioID = portfolioID;
        this.stockName = stockName;
        this.currency = currency;
        this.currentPrice = currentPrice;
        this.stockType = stockType;
    }

    //gets stockdata for graph for a specific ticker 
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
    Stock,
    PriceHistory
};