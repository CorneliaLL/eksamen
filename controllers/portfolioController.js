const { Portfolio } = require("../models/portfolioModels");
const { Account } = require("../models/accountModels");

// Show list of portfolios (used on dashboard)
async function getPortfolios(req, res, next) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    const portfolios = await Portfolio.getAllPortfolios(userID);

    let totalAcquisitionPrice = 0;
    let totalRealizedValue = 0;
    let totalUnrealizedGain = 0;

    // Calculate total values across all portfolios
    for (const p of portfolios) {
      p.acquisitionPrice = await Portfolio.calculateAcquisitionPrice(p.portfolioID);
      totalAcquisitionPrice += p.acquisitionPrice || 0;

      const holdings = await Portfolio.getHoldings(p.portfolioID);
      for (const h of holdings) {
        const realizedValue = await Portfolio.calculateRealizedValue(p.portfolioID, h.Ticker);
        const unrealizedGain = await Portfolio.calculateUnrealizedGain(p.portfolioID, h.Ticker);
        totalRealizedValue += realizedValue || 0;
        totalUnrealizedGain += unrealizedGain || 0;
      }
    }


    // Save computed values to request object for use in the next middleware or render
    req.portfolios = portfolios;
    req.totalAcquisitionPrice = totalAcquisitionPrice;
    req.totalRealizedValue = totalRealizedValue;
    req.totalUnrealizedGain = totalUnrealizedGain;

    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to fetch portfolios");
  }
}

// Show portfolio by ID (detailed portfolio page)
async function getPortfolioByID(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

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

    // Loop through holdings to compute realized and unrealized values
    for (const h of holdings) {
      const expected = await Portfolio.calculateRealizedValue(portfolioID, h.Ticker);
      const gain = await Portfolio.calculateUnrealizedGain(portfolioID, h.Ticker);
      const gak = await Portfolio.calculateGAK(portfolioID, h.Ticker);

      h.realizedValue = expected !== null ? expected : 0;
      h.unrealizedGain = gain !== null ? gain : 0;
      h.gak = gak !== null ? gak : 0;

      totalRealizedValue += h.realizedValue;
      totalUnrealizedGain += h.unrealizedGain;
    }


    res.render("portfolio", {
      portfolio,
      holdings,
      account,
      acquisitionPrice,
      totalRealizedValue,
      totalUnrealizedGain
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to fetch portfolio");
  }
}

// Render the create portfolio form
async function renderCreatePortfolio(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    const accounts = await Account.getAllAccounts(userID);
    res.render('createPortfolio', { accounts });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to fetch accounts");
  }
}

// Handle creation of a new portfolio
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

    res.redirect(/portfolio/${portfolioID});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to create portfolio");
  }
}

// Show portfolio analysis page for a specific stock
async function showPortfolioAnalysis(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    const { portfolioID, stockSymbol } = req.params;
    const portfolio = await Portfolio.findPortfolioByID(portfolioID);
    if (!portfolio) return res.status(404).send("Portfolio not found");
    if (portfolio.userID !== userID) return res.status(403).send("Unauthorized");

    const gak = await Portfolio.calculateGAK(portfolioID, stockSymbol);
    const realizedValue = await Portfolio.calculateRealizedValue(portfolioID, stockSymbol);
    const unrealizedGain = await Portfolio.calculateUnrealizedGain(portfolioID, stockSymbol);

    res.render("portfolioAnalysis", { portfolio, stockSymbol, gak, realizedValue, unrealizedGain });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to show analysis");
  }
}

module.exports = {
  getPortfolios,
  getPortfolioByID,
  renderCreatePortfolio,
  handleCreatePortfolio,
  showPortfolioAnalysis,
};