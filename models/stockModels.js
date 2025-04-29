//Stockmodel combines stock objects with db. It saves and gets data. 

const {connectToDB, sql } = require('../database'); //sql connection from database.js 

//represents stocks and handling of database 
class Stocks{ //stockID?  fordi SQL laver ID'et selv. Simplere og mere standard ifølge DB teori​ forelæsning 17?
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
    //saves a dataobject in the database 
    //input of stockdata in the stock table
        static async storeStock(stock) {
            const pool = await connectToDB(); 
        
            // Indsætter aktiedata i Stocks tabellen
            await pool.request()
            .input('ticker', sql.NVarChar(100), stock.ticker)
            .input('date', sql.Date, stock.date)
            .input('stockName', sql.NVarChar(100), stock.stockName)
            .input('Stockcurrency', sql.NVarChar(100), stock.currency)
            .input('closePrice', sql.Decimal(10,2), stock.closePrice)
            .input('stockType', sql.NVarChar(100), stock.stockType)
            .input('portfolioID', sql.Int, stock.portfolioID)
            .query(`
            INSERT INTO Stocks (Ticker, Date, StockName, stockCurrency, ClosePrice, StockType, PortfolioID)
            VALUES (@ticker, @date, @stockName, @stockcurrency, @closePrice, @stockType, @portfolioID)
            `);
        }
    }/*forklaring: gemme funktion - hele objektet gemmes i databasen i stedet for mange enkeltdele
    i stedet for enkeltdata kan vi arbejde med samlede objekter - forelæsning 15 om struktur
    skal ikke huske rækkefælgen 
    kan genbruge objekt i andre funktioner nemmere*/

    //måske ikke nødvendig fordi vi arbejder med ticker. man finder en aktie baseret på ticker i brugergrænsefladen og ikke stockID
    //database skal have en primætnøgle stockID men ikke brugeren derfor intern db info 
    //gets stockdata for graph for a specific tickerr 
    /*static async findStockByID(stockID) {
        const pool = await connectToDB();
        const result = await pool.request()
            .input('stockID', sql.Int, stockID) // korrekt type + parameter
            .query(`
                SELECT StockID, Ticker, Date, ClosePrice, Currency
                FROM Stocks
                WHERE StockID = @stockID
            `);
    
        return result.recordset[0]; // vi returnerer hele objektet, ikke map
    }*/

    //get lists of all ticker in the database 
    static async getAllStocks() {
        const pool = await connectToDB(); //connects to database 
        //gets tickers from stocks table 
        const result = await pool.request()
            .query(`
                SELECT Ticker, latestDate, ClosePrice 
                FROM Stocks
                ORDER BY Ticker, latestDate DESC
            `);
    
        return result.recordset; //returns tickers as array   
}

class PriceHistory{ //bruges ikke endnu
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