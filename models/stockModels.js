const {connectToDB, sql } = require('../database');  


class Stocks{ 
    constructor(stockID, ticker, latestDate, portfolioID, stockName, stockCurrency, closePrice, stockType){
        this.stockID = stockID;
        this.ticker = ticker;
        this.latestDate = latestDate;
        this.portfolioID = portfolioID;
        this.stockName = stockName;
        this.stockCurrency = stockCurrency;
        this.closePrice = closePrice;
        this.stockType = stockType;
    }
    //Indsætter aktiedata i databasen
        static async storeStock(stock) {
            const pool = await connectToDB(); 
        
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
        } 

    //Finder den nyeste aktie i databasen ved at matche ticker
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

//Metode der henter alle aktier
static async getAllStocks() {
    const pool = await connectToDB();
    const result = await pool.request().query(`
    -- Skaber en Common Table Expression for at rangere aktierne
    --Får en liste af aktier for hver ticker, hvor den nyeste sorteres som nr. 1
        WITH RankedStocks AS (
            SELECT 
                stockID, ticker, latestDate, closePrice, stockCurrency,
                ROW_NUMBER() OVER (PARTITION BY ticker ORDER BY latestDate DESC) AS rn
            FROM Stocks
        )
        -- Vælger kun den nyeste aktie, nr. 1, for hver ticker og sorterer dem efter ticker
        SELECT stockID, ticker, latestDate, closePrice, stockCurrency
        FROM RankedStocks
        WHERE rn = 1
        ORDER BY ticker;
    `);
    return result.recordset;
}

    //Metode der henter aktier i en portefølje
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

//Klasse der henter daglig priser fra vores API
class PriceHistory{ 
    constructor(historyID, stockID, price, priceDate, dailyChange, yearlyChange){
        this.historyID = historyID;
        this.stockID = stockID;
        this.price = price;
        this.priceDate = priceDate;
        this.dailyChange = dailyChange;
        this.yearlyChange = yearlyChange;
    }

    //Metode der gemmer aktiepriser i databasen
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
    
    static async getPriceInfo(ticker) {
        const pool = await connectToDB();
        const result = await pool.request()
        .input('ticker', sql.NVarChar, ticker)
        .query(`
            SELECT TOP 1 price, dailyChange
            FROM PriceHistory PH
            JOIN Stocks S ON PH.stockID = S.stockID
            WHERE S.ticker = @ticker
            ORDER BY PH.priceDate DESC
            `);
        return result.recordset[0];
    }

}



//exports stocks class 
module.exports = { 
    Stocks,
    PriceHistory,
};