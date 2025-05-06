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
        SELECT Portfolios.*, Accounts.userID
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

<<<<<<< Updated upstream
      const holdings = await Portfolio.getHoldings(p.portfolioID);
      for (const h of holdings) {
        const realizedValue = await Portfolio.calculateRealizedValue(p.portfolioID, h.ticker);
        const unrealizedGain = await Portfolio.calculateUnrealizedGain(p.portfolioID, h.ticker);
        totalRealizedValue += realizedValue || 0;
        totalUnrealizedGain += unrealizedGain || 0;
      }
=======
  // Calculate GAK (average acquisition price) for a stock
  static async calculateGAK(portfolioID, Ticker) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .input("Ticker", sql.NVarChar, Ticker)
      .query(`
        SELECT
          SUM(price * quantity) AS totalCost,
          SUM(quantity) AS totalQuantity
        FROM Trades
        JOIN Stocks ON Trades.stockID = Stocks.StockID
        WHERE Trades.portfolioID = @portfolioID AND Stocks.Ticker = @Ticker AND tradeType = 'buy'
      `);

    const { totalCost, totalQuantity } = result.recordset[0];
    if (!totalCost || !totalQuantity || totalQuantity === 0) return null;

    return totalCost / totalQuantity;
  }

  // ✅ Calculate total acquisition cost for portfolio
  static async calculateAcquisitionPrice(portfolioID) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .query(`
        SELECT SUM(price * quantity) AS totalCost
        FROM Trades
        WHERE portfolioID = @portfolioID AND tradeType = 'buy'
      `);

    const { totalCost } = result.recordset[0];
    return totalCost;
  }

  // ✅ Calculate expected (realized) value using live price from API
  static async calculateRealizedValue(portfolioID, Ticker) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .input("Ticker", sql.NVarChar, Ticker)
      .query(`
        SELECT SUM(quantity) AS totalQuantity
        FROM Trades
        JOIN Stocks ON Trades.stockID = Stocks.StockID
        WHERE Trades.portfolioID = @portfolioID AND Stocks.Ticker = @Ticker
      `);

    const { totalQuantity } = result.recordset[0];
    if (!totalQuantity || totalQuantity === 0) return 0;

    const stockData = await fetchStockData(Ticker);
    const currentPrice = parseFloat(stockData.closePrice);

    return parseFloat((totalQuantity * currentPrice).toFixed(2));
  }

  // ✅ Calculate unrealized gain = expected value - cost
  static async calculateUnrealizedGain(portfolioID, Ticker) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .input("Ticker", sql.NVarChar, Ticker)
      .query(`
        SELECT SUM(price * quantity) AS totalCost, SUM(quantity) AS totalQuantity
        FROM Trades
        JOIN Stocks ON Trades.stockID = Stocks.StockID
        WHERE Trades.portfolioID = @portfolioID AND Stocks.Ticker = @Ticker
      `);

    const { totalCost, totalQuantity } = result.recordset[0];
    if (!totalCost || !totalQuantity || totalQuantity === 0) return 0;

    const stockData = await fetchStockData(Ticker);
    const currentPrice = parseFloat(stockData.closePrice);

    const realizedValue = totalQuantity * currentPrice;
    const unrealizedGain = realizedValue - totalCost;

    return parseFloat(unrealizedGain.toFixed(2));
  }

  // ✅ Get all holdings in a portfolio
  static async getHoldings(portfolioID) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .query(`
        SELECT DISTINCT Stocks.Ticker
        FROM Trades
        JOIN Stocks ON Trades.stockID = Stocks.StockID
        WHERE Trades.portfolioID = @portfolioID
      `);

    const holdings = [];
    for (let stock of result.recordset) {
      const Ticker = stock.Ticker;
      const gak = await Portfolio.calculateGAK(portfolioID, Ticker);
      const realizedValue = await Portfolio.calculateRealizedValue(portfolioID, Ticker);
      const unrealizedGain = await Portfolio.calculateUnrealizedGain(portfolioID, Ticker);

      holdings.push({ Ticker, gak, realizedValue, unrealizedGain });
>>>>>>> Stashed changes
    }
    return holdings;
  }

  // ✅ Get total value summary for a user
  static async getTotalValue(userID) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("userID", sql.Int, userID)
      .query(`
        SELECT 
          SUM(CASE WHEN tradeType = 'buy' THEN price * quantity ELSE 0 END) AS totalAcquisitionPrice, 
          SUM(price * quantity) AS totalRealizedValue,
          SUM(Stocks.ClosePrice * quantity) AS totalUnrealizedGain
        FROM Trades
        JOIN Portfolios ON Trades.portfolioID = Portfolios.portfolioID
        JOIN Accounts ON Portfolios.accountID = Accounts.accountID
        JOIN Stocks ON Trades.stockID = Stocks.StockID
        WHERE Accounts.userID = @userID
      `);

<<<<<<< Updated upstream
    const { accountID, portfolioID } = req.params;

    const portfolio = await Portfolio.findPortfolioByID(portfolioID);
    if (!portfolio)
      return res.status(404).send("Portfolio not found");

    console.log(portfolio);

    const account = await Account.findAccountByID(accountID);
    console.log(account);

    if (!account) {
      console.log("Account not found for ID:", accountID);
      return res.status(404).send("Account not found");
    }

    const holdings = await Portfolio.getHoldings(portfolioID);
    const acquisitionPrice = await Portfolio.calculateAcquisitionPrice(portfolioID);
    let totalRealizedValue = 0;
    let totalUnrealizedGain = 0;

    // For loop that loops through holdings
    for (const h of holdings) {
      const expected = await Portfolio.calculateRealizedValue(portfolioID, h.ticker);
      const gain = await Portfolio.calculateUnrealizedGain(portfolioID, h.ticker);
      const gak = await Portfolio.calculateGAK(portfolioID, h.ticker);

      h.realizedValue = expected !== null ? expected : 0;
      h.unrealizedGain = gain !== null ? gain : 0;
      h.gak = gak !== null ? gak : 0;

      totalRealizedValue += h.realizedValue;
      totalUnrealizedGain += h.unrealizedGain;
    }

    // 🔻 NEW: Get portfolio value history for graph
    const valueHistory = await Portfolio.getPriceHistory(portfolioID); // needs to be implemented in your model

    // 🔻 NEW: Prepare pie chart data
    const pieData = holdings.map(h => ({
      ticker: h.Ticker,
      value: h.quantity * (h.currentPrice || 0) // or fallback to gak if no currentPrice
    }));

    res.render("portfolio", {
      portfolio,
      holdings,
      account,
      acquisitionPrice,
      totalRealizedValue,
      totalUnrealizedGain,
      valueHistory, // pass to EJS for line chart
      pieData // pass to EJS for pie chart
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to fetch portfolio");
=======
    return result.recordset[0];
>>>>>>> Stashed changes
  }

  // ✅ Get top 5 holdings by expected value
  static async getTop5Holdings(userID) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("userID", sql.Int, userID)
      .query(`
        SELECT TOP 5 Stocks.Ticker, Portfolios.portfolioName, SUM(price * quantity) AS expectedValue
        FROM Trades
        JOIN Portfolios ON Trades.portfolioID = Portfolios.portfolioID
        JOIN Accounts ON Portfolios.accountID = Accounts.accountID 
        JOIN Stocks ON Trades.stockID = Stocks.StockID
        WHERE Accounts.userID = @userID
        GROUP BY Stocks.Ticker, Portfolios.portfolioName
        ORDER BY expectedValue DESC
      `);
    return result.recordset;
  }

<<<<<<< Updated upstream
// Create a new portfolio
async function handleCreatePortfolio(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    const { accountID, portfolioName } = req.body;
    const account = await Account.findAccountByID(accountID);
    if (!account) return res.status(400).send("Invalid account ID");

    const registrationDate = new Date();
    const portfolio = new Portfolio(null, accountID, portfolioName, registrationDate);
    const portfolioID = await portfolio.createNewPortfolio({ accountID, portfolioName, registrationDate });

    res.redirect(`/portfolio/${portfolioID}`);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to create portfolio");
  }
}

// Show portfolio analysis for a specific stock
async function showPortfolioAnalysis(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    const { portfolioID, stockTicker } = req.params;
    const portfolio = await Portfolio.findPortfolioByID(portfolioID);
    if (!portfolio) return res.status(404).send("Portfolio not found");
    if (portfolio.userID !== userID) return res.status(403).send("Unauthorized");

    const gak = await Portfolio.calculateGAK(portfolioID, stockTicker);
    const realizedValue = await Portfolio.calculateExpectedValue(portfolioID, stockTicker);
    const unrealizedGain = await Portfolio.calculateUnrealizedGain(portfolioID, stockTicker);

    res.render("portfolioAnalysis", { portfolio, stockTicker, gak, realizedValue, unrealizedGain });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to show analysis");
=======
  // ✅ Get price history for a stock (watch out: needs stockID, not Ticker)
  static async getPriceHistory(stockID) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("stockID", sql.Int, stockID)
      .query(`
        SELECT TOP 30 price AS ClosePrice, priceDate
        FROM Pricehistory
        WHERE stockID = @stockID
        ORDER BY priceDate DESC
      `);
    return result.recordset;
>>>>>>> Stashed changes
  }
}

module.exports = {
  Portfolio
};
