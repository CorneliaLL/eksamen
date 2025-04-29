const { Portfolio } = require("../models/portfolioModels");
const { Account } = require("../models/accountModels");

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

// Show list of portfolios
//Tilføj calculate GAK her og i funktionen under!!!!!!! 
async function getPortfolios(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    const { accountID } = req.params;

    const portfolios = await Portfolio.getAllPortfolios(userID);
    const account = await Account.findAccountByID(accountID)
    res.render("accountDashboard", { portfolios, account });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to fetch portfolios");
  }
}


// Show portfolio by ID
async function getPortfolioByID(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) 
    return res.status(401).send("Unauthorized");

    const { portfolioID } = req.params;
    const portfolio = await Portfolio.findPortfolioByID(portfolioID); 
    if (!portfolio) 
    return res.status(404).send("Portfolio not found");

    const holdings = await Portfolio.getHoldings(portfolioID);

    //calculate the GAK for the portfolio 
    //MANGLER



    res.render("portfolio", { portfolio, holdings });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to fetch portfolio");
  }
}



// Show portfolio analysis for a specific stock
// calculates GAK, expected value and unrealized gain for a specific stock in a portfolio
async function showPortfolioAnalysis(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    const { portfolioID, stockSymbol } = req.params;

    const portfolio = await Portfolio.findPortfolioByID(portfolioID);

    if (!portfolio) return res.status(404).send("Portfolio not found");
    if (portfolio.userID !== userID) return res.status(403).send("Unauthorized");

    //Fetches the value directly from models, gak = totalCost / totalQuantity
    const gak = await Portfolio.calculateGAK(portfolioID, Ticker);
    const expectedValue = await Portfolio.calculateExpectedValue(portfolioID, Ticker);
    const unrealizedGain = await Portfolio.calculateUnrealizedGain(portfolioID, Ticker);

    res.render("portfolioAnalysis", { portfolio, Ticker, gak, expectedValue, unrealizedGain });
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
