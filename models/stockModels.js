//Stockmodel combines stock objects with db. It saves and gets data. 

const {connectToDB, sql } = require('../database'); //sql connection from database.js 

//represents stocks and handling of database 
class Stocks{ //stockID slettet - fordi SQL laver ID'et selv. Simplere og mere standard ifølge DB teori​ forelæsning 17?
    constructor(ticker, latestDate, portfolioID, stockName, stockCurrency, closePrice, stockType){
        this.ticker = ticker;
        this.latestDate = latestDate;
        this.portfolioID = portfolioID;
        this.stockName = stockName;
        this.stockCurrency = stockCurrency;
        this.closePrice = closePrice;
        this.stockType = stockType;
    }
    //saves stockdata in the database 
    //input of stockdata in the stock table
        static async storeStock(stock) {
            const pool = await connectToDB(); 
        
            // Indsætter aktiedata i Stocks tabellen
            await pool.request()
            .input('Ticker', sql.NVarChar(100), stock.ticker)
            .input('Date', sql.Date, stock.latestDate)
            .input('StockName', sql.NVarChar(100), stock.stockName)
            .input('StockCurrency', sql.NVarChar(100), stock.stockCurrency)
            .input('ClosePrice', sql.Decimal(10,2), stock.closePrice)
            .input('StockType', sql.NVarChar(100), stock.stockType)
            .input('PortfolioID', sql.Int, stock.portfolioID)
            .query(`
            INSERT INTO Stocks (Ticker, Date, StockName, StockCurrency, ClosePrice, StockType, PortfolioID)
            VALUES (@Ticker, @Date, @StockName, @StockCurrency, @ClosePrice, @StockType, @PortfolioID)
            `);
        } /*forklaring: gemme funktion - hele objektet gemmes i databasen i stedet for mange enkeltdele
    i stedet for enkeltdata kan vi arbejde med samlede objekter - forelæsning 15 om struktur. skal ikke huske rækkefælgen. kan genbruge objekt i andre funktioner nemmere*/

    //finds newest version of stock by ticker 
    static async findStockByTicker(ticker) {
        const pool = await connectToDB();
        const result = await pool.request()
            .input('ticker', sql.NVarChar(100), ticker)
            .query(`
                SELECT TOP 1 *
                FROM Stocks
                WHERE Ticker = @ticker
                ORDER BY LatestDate DESC
            `);
        return result.recordset[0]; // en aktie
    }

//returns lists of all stocks
    static async getAllStocks() {
        const pool = await connectToDB(); //connects to database 
        //gets tickers from stocks table 
        const result = await pool.request()
            .query(`
                SELECT Ticker, LatestDate, ClosePrice, StockCurrency 
                FROM Stocks
                ORDER BY Ticker, latestDate DESC
            `);
    
        return result.recordset; //returns tickers as array   
        }

    static async getStocksByPortfolioID(portfolioID) {
        const pool = await connectToDB(); // Connects to DB
        const result = await pool.request()
          .input('PortfolioID', sql.Int, portfolioID) // <-- Tilføj input her
          .query(`
          SELECT Ticker, LatestDate, ClosePrice, StockCurrency, PortfolioID
          FROM Stocks
          WHERE PortfolioID = @PortfolioID
          ORDER BY Ticker, LatestDate DESC
          `);
      
        return result.recordset;
      }

};  
//bruges ikke endnu
//Skal hente daglig priser fra vores API
class PriceHistory{ 
    constructor(historyID, stockID, price, priceDate){
        this.historyID = historyID;
        this.stockID = stockID;
        this.price = price;
        this.priceDate = priceDate;
    }
}

//exports stocks class 
module.exports = { 
    Stocks,
    PriceHistory
};