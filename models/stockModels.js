const {connectToDB, sql } = require('../database'); //sql connection from database.js 

class Stocks{
    constructor(stockID, ticker, date, portfolioID, stockName, stockCurrency, closePrice, stockType){
        this.stockID = stockID;
        this.ticker = ticker;
        this.date = date;
        this.portfolioID = portfolioID;
        this.stockName = stockName;
        this.stockCurrency = stockCurrency;
        this.closePrice = closePrice;
        this.stockType = stockType;
    }
    static async storeStockData(ticker, stockName, latestDate, stockCurrency, closePrice, portfolioID, stockType){
        const pool = await connectToDB();

        const result = await pool.request()
            .input("ticker", sql.NVarChar(100), ticker)
            .input("stockName", sql.NVarChar(100), stockName)
            .input("latestDate", sql.Date, latestDate)
            .input("stockCurrency", sql.NVarChar(100), stockCurrency)
            .input("closePrice", sql.Decimal(10, 2), closePrice)
            .input("portfolioID", sql.Int, portfolioID)
            .input("stockType", sql.NVarChar(100), stockType)
            .query(`
                INSERT INTO Stocks (Ticker, stockName, latestDate, stockCurrency, ClosePrice, portfolioID, stockType)
                VALUES (@ticker, @stockName, @latestDate, @stockCurrency, @closePrice, @portfolioID, @stockType)
                `);
    }

    //gets stockdata for graph for a specific tickerr 
    static async findStockByID(stockID) {
        const pool = await connectToDB();
        const result = await pool.request()
            .input('stockID', sql.Int, stockID) // korrekt type + parameter
            .query(`
                SELECT StockID, Ticker, Date, ClosePrice, Currency
                FROM Stocks
                WHERE StockID = @stockID
            `);
    
        return result.recordset[0]; // vi returnerer hele objektet, ikke map
    }


    //gets all stock for list
    static async getAllStocks() {
        const pool = await connectToDB();
        const result = await pool.request()
            .query(`
                SELECT Ticker, latestDate, ClosePrice 
                FROM Stocks
                ORDER BY Ticker, latestDate DESC
            `);
    
        return result.recordset;
    }

}

class PriceHistory{
    constructor(historyID, stockID, price, priceDate){
        this.historyID = historyID;
        this.stockID = stockID;
        this.price = price;
        this.priceDate = priceDate;
    }
}

module.exports = { 
    Stocks,
    PriceHistory
};