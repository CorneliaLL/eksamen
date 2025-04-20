const { connectToDB, sql } = require("../database");

class Portfolio{
  constructor(portfolioID, accountID, portfolioName, registrationDate){
      this.portfolioID = portfolioID;
      this.accountID = accountID;
      this.portfolioName = portfolioName;
      this.registrationDate = registrationDate;
  }
}

// Async function to fetch all portfolios from one user from the DB
async function getAllPortfolios(userID) {
  const pool = await connectToDB();

  const result = await pool.request()
    .input("userID", sql.Int, userID)
    .query(`
      SELECT * FROM Portfolios
      JOIN Accounts ON Portfolios.accountID = Accounts.accountID
      WHERE userID = @userID
    `);

  // Returns the whole list of portfolios for this user
  return result.recordset;
}

// Fetch a specific portfolio by ID
async function findPortfolioByID(portfolioID) {
    try {
      const pool = await connectToDB();
      const result = await pool.request()
        .input("portfolioID", sql.Int, portfolioID)
        .query(`
          SELECT * FROM Portfolios 
          WHERE portfolioID = @portfolioID
        `);
  
      const portfolio = result.recordset[0];
      return portfolio || null;
    } catch (err) {
      console.error("Error finding portfolio by ID:", err.message);
      return null;
    }
  }

// Create a new portfolio 
async function createNewPortfolio({ userID, accountID, portfolioName, registrationDate }) {
    const pool = await connectToDB();
    await pool.request()
      .input("userID", sql.Int, userID)
      .input("accountID", sql.Int, accountID)
      .input("portfolioName", sql.NVarChar, portfolioName)
      .input("registrationDate", sql.DateTime, registrationDate)
      .query(`
        INSERT INTO Portfolios (userID, accountID, portfolioName, registrationDate)
        VALUES (@userID, @accountID, @portfolioName, @registrationDate)
      `);
  }
  
  // Calculate GAK for a specific stock in a portfolio
  async function calculateGAK(portfolioID, stockID) {
    try {
      const pool = await connectToDB();
      const result = await pool.request()
        .input("portfolioID", sql.Int, portfolioID)
        .input("stockID", sql.Int, stockID)
        .query(`
          SELECT
            SUM(price * quantity) AS totalCost,
            SUM(quantity) AS totalQuantity
          FROM Trade
          WHERE portfolioID = @portfolioID AND stockID = @stockID AND tradeType = 'buy'
        `);
  
      const { totalCost, totalQuantity } = result.recordset[0];
  
      if (!totalCost || !totalQuantity || totalQuantity === 0) {
        return null;
      }
  
      return totalCost / totalQuantity;
    } catch (err) {
      console.error("Error calculating GAK:", err.message);
      return null;
    }
  }
 // https://www.w3schools.com/sql/sql_sum.asp
  


  // Calculate expected value of a stock in a portfolio
  async function calculateExpectedValue(portfolioID, stockID) {
    try {
      const pool = await connectToDB();
  
      const tradeResult = await pool.request()
        .input("portfolioID", sql.Int, portfolioID)
        .input("stockID", sql.Int, stockID)
        .query(`
          SELECT SUM(quantity) AS totalQuantity
          FROM Trade
          WHERE portfolioID = @portfolioID AND stockID = @stockID AND tradeType = 'buy'
        `);
  
      const { totalQuantity } = tradeResult.recordset[0];
  
      if (!totalQuantity || totalQuantity === 0) {
        return 0;
      }
  
      const priceResult = await pool.request()
        .input("stockID", sql.Int, stockID)
        .query(`
          SELECT currentPrice 
          FROM Stock 
          WHERE stockID = @stockID
        `);
  
      const { currentPrice } = priceResult.recordset[0];
  
      if (!currentPrice) {
        console.warn("Price not found for stock:", stockID);
        return null;
      }
  
      return parseFloat((totalQuantity * currentPrice).toFixed(2));
    } catch (err) {
      console.error("Error calculating expected value:", err.message);
      return null;
    }
  }
  
  // Calculate unrealized gain/loss for a stock in a portfolio
  async function calculateUnrealizedGain(portfolioID, stockID) {
    try {
      const pool = await connectToDB();
  
      const tradeResult = await pool.request()
        .input("portfolioID", sql.Int, portfolioID)
        .input("stockID", sql.Int, stockID)
        .query(`
          SELECT 
            SUM(quantity * price) AS totalCost,
            SUM(quantity) AS totalQuantity
          FROM Trade
          WHERE portfolioID = @portfolioID AND stockID = @stockID AND tradeType = 'buy'
        `);
  
      const { totalCost, totalQuantity } = tradeResult.recordset[0];
  
      if (!totalCost || !totalQuantity || totalQuantity === 0) {
        return 0;
      }
  
      const priceResult = await pool.request()
        .input("stockID", sql.Int, stockID)
        .query(`
          SELECT currentPrice
          FROM Stock
          WHERE stockID = @stockID
        `);
  
      const { currentPrice } = priceResult.recordset[0];
  
      if (!currentPrice) {
        console.error("Current price not found for stock:", stockID);
        return null;
      }
  
      const expectedValue = totalQuantity * currentPrice;
      const unrealizedGain = expectedValue - totalCost;
  
      return parseFloat(unrealizedGain.toFixed(2));
    } catch (err) {
      console.error("Error calculating unrealized gain:", err.message);
      return null;
    }
  }

  // Get holdings for a specific portfolio
  async function getHoldings(portfolioID) {
    const pool = await connectToDB();

    // Fetch all stocks in the portfolio
    const result = await pool.request()
    .input("portfolioID", sql.Int, portfolioID)
    .query(`
      SELECT DISTINCT stockID
      FROM Trade
      WHERE portfolioID = @portfolioID
    `);

    const stocks = result.recordset;
  
  // calculate for each stock in the portfolio
  const holdings = [];
  for (let stock of stocks) {
    const stockID = stock.stockID;

    const gak = await calculateGAK(portfolioID, stockID);
    const expectedValue = await calculateExpectedValue(portfolioID, stockID);
    const unrealizedGain = await calculateUnrealizedGain(portfolioID, stockID);

    holdings.push({stockID, gak, expectedValue, unrealizedGain});
  }
  return holdings;
}

  module.exports = {
    Portfolio,
    getAllPortfolios,
    findPortfolioByID,
    createNewPortfolio,
    calculateGAK,
    calculateExpectedValue,
    calculateUnrealizedGain
  };
  