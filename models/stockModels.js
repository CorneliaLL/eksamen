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
            .input('ticker', sql.NVarChar(100), stock.ticker)
            .input('latestDate', sql.Date, stock.latestDate)
            .input('stockName', sql.NVarChar(100), stock.stockName)
            .input('stockCurrency', sql.NVarChar(100), stock.stockCurrency)
            .input('closePrice', sql.Decimal(10,2), stock.closePrice)
            .input('stockType', sql.NVarChar(100), stock.stockType)
            .input('portfolioID', sql.Int, stock.portfolioID)
            .query(`
            INSERT INTO Stocks (ticker, latestDate, stockName, stockCurrency, closePrice, stockType, portfolioID)
            VALUES (@ticker, @latestDate, @stockName, @stockCurrency, @closePrice, @stockType, @portfolioID)
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
                WHERE ticker = @ticker
                ORDER BY latestDate DESC
            `);
        return result.recordset[0]; // en aktie
    }

//returns lists of all stocks
static async getAllStocks() {
    const pool = await connectToDB();
    const result = await pool.request().query(`
        WITH RankedStocks AS (
            SELECT 
                stockID, ticker, latestDate, closePrice, stockCurrency,
                ROW_NUMBER() OVER (PARTITION BY ticker ORDER BY latestDate DESC) AS rn
            FROM Stocks
        )
        SELECT stockID, ticker, latestDate, closePrice, stockCurrency
        FROM RankedStocks
        WHERE rn = 1
        ORDER BY ticker;
    `);
    return result.recordset;
}


    

    static async getStocksByPortfolioID(portfolioID) {
        const pool = await connectToDB(); // Connects to DB
        const result = await pool.request()
          .input('portfolioID', sql.Int, portfolioID) // <-- Tilføj input her
          .query(`
          SELECT ticker, latestDate, closePrice, stockCurrency, portfolioID
          FROM Stocks
          WHERE portfolioID = @portfolioID
          ORDER BY ticker, latestDate DESC
          `);
      
        return result.recordset;
      }
};  
//bruges ikke endnu?
//Skal hente daglig priser fra vores API
class PriceHistory{ 
    constructor(historyID, stockID, price, priceDate, dailyChange, yearlyChange){
        this.historyID = historyID;
        this.stockID = stockID;
        this.price = price;
        this.priceDate = priceDate;
        this.dailyChange = dailyChange;
        this.yearlyChange = yearlyChange;
    }

    static async storePriceHistory({stockID, price, priceDate, dailyChange, yearlyChange}) {    
        const pool = await connectToDB();
    
     await pool.request()
        .input('stockID', sql.Int, stockID)
        .input('price', sql.Decimal(18,4), price)
        .input('priceDate', sql.DateTime2(7), priceDate)
        .input('dailyChange', sql.Decimal(18,4), dailyChange)
        .input('yearlyChange', sql.Decimal(18,4), yearlyChange)
        .query(`
            MERGE PriceHistory AS target
            USING (SELECT @stockID AS stockID, @priceDate AS priceDate) AS source
            ON target.stockID = source.stockID AND target.priceDate = source.priceDate
            WHEN NOT MATCHED THEN
                INSERT (stockID, price, priceDate, dailyChange, yearlyChange)
                VALUES (@stockID, @price, @priceDate, @dailyChange, @yearlyChange);
        `);
        
    }

}



//exports stocks class 
module.exports = { 
    Stocks,
    PriceHistory,
};