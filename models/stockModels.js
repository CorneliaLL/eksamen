const {connectToDB, sql } = require('../database'); //sql connection from database.js 

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
        const pool = await connectToDB();

        const result = await pool.request()
            .input("ticker", sql.NVarChar(100), ticker)
            .input("stockName", sql.NVarChar(100), stockName)
            .input("date", sql.Date, date)
            .input("currency", sql.NVarChar(100), currency)
            .input("closePrice", sql.Decimal(10, 2), closePrice)
            .input("portfolioID", sql.Int, portfolioID)
            .input("stockType", sql.NVarChar(100), stockType)
            .query(`
                INSERT INTO Stocks (Ticker, stockName, Date, currency, ClosePrice, portfolioID, stockType)
                VALUES (@ticker, @stockName, @date, @currency, @closePrice, @portfolioID, @stockType)
                `);
    }

    //gets stockdata for graph for a specific tickerr 
    async getStockData(ticker) {
        const pool = await connectToDB();
        const result = await pool.request()
            .input('ticker', ticker) // Sikker måde at undgå SQL Injection
            .query(`
                SELECT Date, ClosePrice 
                FROM Stocks
                WHERE Ticker = @ticker
                ORDER BY Date ASC
            `);

        return {
            dates: result.recordset.map(r => r.Date.toISOString().split('T')[0]),
            prices: result.recordset.map(r => r.ClosePrice)
        };
    }

    //gets all stock for list
    static async getAllStocks() {
        const pool = await connectToDB();
        const result = await pool.request()
            .query(`
                SELECT Ticker, Date, ClosePrice 
                FROM Stocks
                ORDER BY Ticker, Date DESC
            `);
    
        return result.recordset;
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