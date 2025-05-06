const { connectToDB, sql } = require("../database");
const { fetchStockData } = require("../services/fetchStockData");

class Portfolio {
  constructor(portfolioID, accountID, portfolioName, registrationDate) {
    this.portfolioID = portfolioID;
    this.accountID = accountID;
    this.portfolioName = portfolioName;
    this.registrationDate = registrationDate;
  }

  // Create a new portfolio
  async createNewPortfolio({ accountID, portfolioName, registrationDate }) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("accountID", sql.Int, accountID)
      .input("portfolioName", sql.NVarChar, portfolioName)
      .input("registrationDate", sql.DateTime, registrationDate)
      .query(`
        INSERT INTO Portfolios (accountID, portfolioName, registrationDate)
        OUTPUT INSERTED.portfolioID
        VALUES (@accountID, @portfolioName, @registrationDate)
      `);
    return result.recordset[0].portfolioID;
  }

  // Get all portfolios for a specific user
  static async getAllPortfolios(userID) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("userID", sql.Int, userID)
      .query(`
        SELECT * 
        FROM Portfolios
        JOIN Accounts ON Portfolios.accountID = Accounts.accountID
        WHERE Accounts.userID = @userID
      `);
    return result.recordset;
  }

  // Find one specific portfolio
  static async findPortfolioByID(portfolioID) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .query(`
        SELECT Portfolios.*, Accounts.userID
        FROM Portfolios
        JOIN Accounts ON Portfolios.accountID = Accounts.accountID
        WHERE Portfolios.portfolioID = @portfolioID
      `);
    return result.recordset[0] || null;
  }

  // Calculate GAK (Average Acquisition Price) for a stock
  static async calculateGAK(portfolioID, ticker) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .input("ticker", sql.NVarChar, ticker)
      .query(`
        SELECT
          SUM(price * quantity) AS totalCost,
          SUM(quantity) AS totalQuantity
        FROM Trades
        WHERE portfolioID = @portfolioID AND Ticker = @ticker AND tradeType = 'buy'
      `);

    const { totalCost, totalQuantity } = result.recordset[0];
    if (!totalCost || !totalQuantity || totalQuantity === 0) return null;

    return totalCost / totalQuantity;
  }

  // Calculate total acquisition price (cost) of shares
  static async calculateAcquisitionPrice(portfolioID) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .query(`
        SELECT
          SUM(price * quantity) AS totalCost
        FROM Trades
        WHERE portfolioID = @portfolioID AND tradeType = 'buy'
      `);

    const { totalCost } = result.recordset[0];
    return totalCost;
  }

  // Calculate realized (current) value based on live price from API
  static async calculateRealizedValue(portfolioID, ticker) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .input("ticker", sql.NVarChar, ticker)
      .query(`
        SELECT SUM(quantity) AS totalQuantity
        FROM Trades
        WHERE portfolioID = @portfolioID AND Ticker = @ticker
      `);

    const { totalQuantity } = result.recordset[0];
    if (!totalQuantity || totalQuantity === 0) return 0;

    const stockData = await fetchStockData(ticker);
    const currentPrice = parseFloat(stockData.closePrice);

    return parseFloat((totalQuantity * currentPrice).toFixed(2));
  }

  // Calculate unrealized gain or loss
  static async calculateUnrealizedGain(portfolioID, ticker) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .input("ticker", sql.NVarChar, ticker)
      .query(`
        SELECT
          SUM(price * quantity) AS totalCost,
          SUM(quantity) AS totalQuantity
        FROM Trades
        WHERE portfolioID = @portfolioID AND Ticker = @ticker
      `);

    const { totalCost, totalQuantity } = result.recordset[0];
    if (!totalCost || !totalQuantity || totalQuantity === 0) return 0;

    const stockData = await fetchStockData(ticker);
    const currentPrice = parseFloat(stockData.closePrice);

    const realizedValue = totalQuantity * currentPrice;
    const unrealizedGain = realizedValue - totalCost;

    return parseFloat(unrealizedGain.toFixed(2));
  }

  // Get all holdings (distinct tickers) in portfolio
  static async getHoldings(portfolioID) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .query(`
      SELECT Ticker, 
      SUM(CASE WHEN tradeType = 'buy' THEN quantity ELSE -quantity END) AS quantity
      FROM Trades
      WHERE portfolioID = @portfolioID
      GROUP BY Ticker
      HAVING SUM(CASE WHEN tradeType = 'buy' THEN quantity ELSE -quantity END) > 0
      `);


    const holdings = [];
    for (let stock of result.recordset) {
      const ticker = stock.Ticker;

      const gak = await Portfolio.calculateGAK(portfolioID, ticker);
      const realizedValue = await Portfolio.calculateRealizedValue(portfolioID, ticker);
      const unrealizedGain = await Portfolio.calculateUnrealizedGain(portfolioID, ticker);

      holdings.push({ Ticker, quantity, gak, realizedValue, unrealizedGain });
    }
    return holdings;
  }

  // Get overall portfolio value summary for a user
  static async getTotalValue(userID) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("userID", sql.Int, userID)
      .query(`
        SELECT 
          SUM(CASE WHEN tradeType = 'buy' THEN price * quantity ELSE 0 END) AS totalAcquisitionPrice,
          SUM(price * quantity) AS totalRealizedValue,
          SUM(Stocks.ClosePrice * Trades.quantity) AS totalUnrealizedGain
        FROM Trades
        JOIN Portfolios ON Trades.portfolioID = Portfolios.portfolioID
        JOIN Accounts ON Portfolios.accountID = Accounts.accountID
        JOIN Stocks ON Trades.stockID = Stocks.StockID
        WHERE Accounts.userID = @userID
      `);

    return result.recordset[0];
  }

  // Get top 5 holdings by expected value
  static async getTop5Holdings(userID) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("userID", sql.Int, userID)
      .query(`
        SELECT TOP 5 Trades.Ticker, Portfolios.portfolioName, SUM(price * quantity) AS expectedValue
        FROM Trades
        JOIN Portfolios ON Trades.portfolioID = Portfolios.portfolioID
        JOIN Accounts ON Portfolios.accountID = Accounts.accountID
        JOIN Stocks ON Trades.stockID = Stocks.StockID
        WHERE Accounts.userID = @userID
        GROUP BY Trades.Ticker, Portfolios.portfolioName
        ORDER BY expectedValue DESC
      `);
    return result.recordset;
  }

  static async getTop5HoldingsByUnrealizedGain(userID) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("userID", sql.Int, userID)
      .query(`
        SELECT TOP 5 
          Trades.Ticker, 
          Portfolios.portfolioName, 
          SUM((Stocks.ClosePrice * Trades.quantity) - (Trades.price * Trades.quantity)) AS unrealizedGain
        FROM Trades
        JOIN Portfolios ON Trades.portfolioID = Portfolios.portfolioID
        JOIN Accounts ON Portfolios.accountID = Accounts.accountID
        JOIN Stocks ON Trades.stockID = Stocks.StockID
        WHERE Accounts.userID = @userID
        GROUP BY Trades.Ticker, Portfolios.portfolioName
        ORDER BY unrealizedGain DESC
      `);
    return result.recordset;
  }  

  // Get price history for a specific stock
  static async getPriceHistory(stockID) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("stockID", sql.Int, stockID)
      .query(`
        SELECT TOP 30 price, priceDate
        FROM Pricehistory
        WHERE stockID = @stockID
        ORDER BY priceDate DESC
      `);
    return result.recordset;
  }
}

module.exports = {
  Portfolio
};
