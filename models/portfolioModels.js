const { connectToDB, sql } = require("../database");
const { storeStockData } = require("../services/fetchStockData");

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

//Evt ændre SQL koden 
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

  // Calculate GAK (Average Acquisition Price) for a stock
  // GAK = (total cost of share / total quantity of shares)
  // calculates the average acquisition prie for a stoick in a portfolio

  //Fetches relevant data from DB and calculates the GAK directly.
  static async calculateGAK(portfolioID, Ticker) { 
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID) 
      .input("Ticker", sql.NVarChar, Ticker)
      .query(`
        SELECT
          SUM(pricePerShare * quantity) AS totalCost,
          SUM(quantity) AS totalQuantity
        FROM Trades
        WHERE portfolioID = @portfolioID AND Ticker = @Ticker AND tradeType = 'buy'
      `);

    const { totalCost, totalQuantity } = result.recordset[0];
    if (!totalCost || !totalQuantity || totalQuantity === 0) return null;

//calculates GAK directly so it can be fetched directly
    return totalCost / totalQuantity;
  }

  // Calculate Expected Value of a stock in a portfolio based on live price from API
  // Expected value = current price * total quantity of shares
  static async calculateExpectedValue(portfolioID, Ticker) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .input("Ticker", sql.NVarChar, Ticker)
      .query(`
        SELECT SUM(quantity) AS totalQuantity
        FROM Trades
        WHERE portfolioID = @portfolioID AND Ticker = @Ticker
      `);

    const { totalQuantity } = result.recordset[0];
    if (!totalQuantity || totalQuantity === 0) return 0;

    const stockData = await storeStockData(Ticker);
    const currentPrice = parseFloat(stockData.closePrice);

    return parseFloat((totalQuantity * currentPrice).toFixed(2));
  }

  // Calculate Unrealized Gain or Loss
  //unrealized gain = expected value - total cost of shares
  static async calculateUnrealizedGain(portfolioID, Ticker) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .input("Ticker", sql.NVarChar, Ticker)
      .query(`
        SELECT
          SUM(pricePerShare * quantity) AS totalCost, 
          SUM(quantity) AS totalQuantity
        FROM Trades
        WHERE portfolioID = @portfolioID AND Ticker = @Ticker
      `);

    
    const { totalCost, totalQuantity } = result.recordset[0];
    if (!totalCost || !totalQuantity || totalQuantity === 0) return 0;

    // get the current price from the API 
    const stockData = await storeStockData(Ticker);
    const currentPrice = parseFloat(stockData.closePrice);

    // calculate the expected value of the stock in the portfolio
    const expectedValue = totalQuantity * currentPrice;
    const unrealizedGain = expectedValue - totalCost;

    //round the unrealized gain to 2 decimal 
    return parseFloat(unrealizedGain.toFixed(2));
  }

  // Get all holdings (stocks) in a portfolio
  static async getHoldings(portfolioID) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .query(`
        SELECT DISTINCT Ticker -- use DISTINCT to avoid duplicates
        FROM Trades
        WHERE portfolioID = @portfolioID
      `);


    const holdings = []; // initialize an empty array to store the holdings
    for (let stock of result.recordset) { // iterate over the stocks
      const Ticker = stock.Ticker; // get the stock ticker
      
      // //calculate the GAK, expected value and unleazized gain for each stock 
      const gak = await Portfolio.calculateGAK(portfolioID, Ticker);
      const expectedValue = await Portfolio.calculateExpectedValue(portfolioID, Ticker); 
      const unrealizedGain = await Portfolio.calculateUnrealizedGain(portfolioID, Ticker);

      holdings.push({ Ticker, gak, expectedValue, unrealizedGain });
    }
    return holdings;
  }
}



  module.exports = {
    Portfolio
  };
