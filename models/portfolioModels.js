const { connectToDB, sql } = require("../database");
const { storeStockData } = require("../services/stockService");

class Portfolio {
  constructor(portfolioID, accountID, portfolioName, registrationDate) {
    this.portfolioID = portfolioID;
    this.accountID = accountID;
    this.portfolioName = portfolioName;
    this.registrationDate = registrationDate;
  }

  // Get all portfolios for a specific user
  static async getAllPortfolios(userID) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("userID", sql.Int, userID)
      .query(`
        SELECT * FROM Portfolios
        JOIN Accounts ON Portfolios.accountID = Accounts.accountID
        WHERE userID = @userID
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

  // Calculate GAK (Average Acquisition Price) for a stock
  static async calculateGAK(portfolioID, stockSymbol) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .input("stockSymbol", sql.NVarChar, stockSymbol)
      .query(`
        SELECT
          SUM(pricePerShare * quantity) AS totalCost,
          SUM(quantity) AS totalQuantity
        FROM Trades
        WHERE portfolioID = @portfolioID AND stockSymbol = @stockSymbol AND type = 'buy'
      `);

    const { totalCost, totalQuantity } = result.recordset[0];
    if (!totalCost || !totalQuantity || totalQuantity === 0) return null;

    return totalCost / totalQuantity;
  }

  // Calculate Expected Value of a stock based on live price
  static async calculateExpectedValue(portfolioID, stockSymbol) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .input("stockSymbol", sql.NVarChar, stockSymbol)
      .query(`
        SELECT SUM(quantity) AS totalQuantity
        FROM Trades
        WHERE portfolioID = @portfolioID AND stockSymbol = @stockSymbol
      `);

    const { totalQuantity } = result.recordset[0];
    if (!totalQuantity || totalQuantity === 0) return 0;

    const stockData = await storeStockData(stockSymbol);
    const currentPrice = parseFloat(stockData.closePrice);

    return parseFloat((totalQuantity * currentPrice).toFixed(2));
  }

  // Calculate Unrealized Gain or Loss
  static async calculateUnrealizedGain(portfolioID, stockSymbol) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .input("stockSymbol", sql.NVarChar, stockSymbol)
      .query(`
        SELECT
          SUM(pricePerShare * quantity) AS totalCost,
          SUM(quantity) AS totalQuantity
        FROM Trades
        WHERE portfolioID = @portfolioID AND stockSymbol = @stockSymbol
      `);

    const { totalCost, totalQuantity } = result.recordset[0];
    if (!totalCost || !totalQuantity || totalQuantity === 0) return 0;

    const stockData = await storeStockData(stockSymbol);
    const currentPrice = parseFloat(stockData.closePrice);

    const expectedValue = totalQuantity * currentPrice;
    const unrealizedGain = expectedValue - totalCost;

    return parseFloat(unrealizedGain.toFixed(2));
  }

  // Get all holdings (stocks) in a portfolio
  static async getHoldings(portfolioID) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .query(`
        SELECT DISTINCT stockSymbol
        FROM Trades
        WHERE portfolioID = @portfolioID
      `);

    const holdings = [];
    for (let stock of result.recordset) {
      const stockSymbol = stock.stockSymbol;
      const gak = await Portfolio.calculateGAK(portfolioID, stockSymbol);
      const expectedValue = await Portfolio.calculateExpectedValue(portfolioID, stockSymbol);
      const unrealizedGain = await Portfolio.calculateUnrealizedGain(portfolioID, stockSymbol);

      holdings.push({ stockSymbol, gak, expectedValue, unrealizedGain });
    }
    return holdings;
  }
}

module.exports = { Portfolio };
