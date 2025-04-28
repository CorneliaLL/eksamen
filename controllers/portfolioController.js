const { Portfolio } = require("../models/portfolioModels");
const { Account } = require("../models/accountModels");


// Show list of portfolios
async function getPortfolios(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    const portfolios = await Portfolio.getAllPortfolios(userID);
    res.render("accountDashboard", { portfolios });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to fetch portfolios");
  }
}


// Show portfolio by ID
async function getPortfolioByID(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    const { portfolioID } = req.params;
    const portfolio = await Portfolio.findPortfolioByID(portfolioID);
    if (!portfolio) return res.status(404).send("Portfolio not found");

    const holdings = await Portfolio.getHoldings(portfolioID);
    res.render("portfolio", { portfolio, holdings });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to fetch portfolio");
  }
}



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

    const { portfolioID, stockSymbol } = req.params;
    const portfolio = await Portfolio.findPortfolioByID(portfolioID);
    if (!portfolio) return res.status(404).send("Portfolio not found");
    if (portfolio.userID !== userID) return res.status(403).send("Unauthorized");

    const gak = await Portfolio.calculateGAK(portfolioID, stockSymbol);
    const expectedValue = await Portfolio.calculateExpectedValue(portfolioID, stockSymbol);
    const unrealizedGain = await Portfolio.calculateUnrealizedGain(portfolioID, stockSymbol);

    res.render("portfolioAnalysis", { portfolio, stockSymbol, gak, expectedValue, unrealizedGain });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to show analysis");
  }
}


module.exports = {
  getPortfolios,
  getPortfolioByID,
  handleCreatePortfolio,
  showPortfolioAnalysis,
};
