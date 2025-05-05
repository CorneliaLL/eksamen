const { Portfolio } = require("../models/portfolioModels");
const { Account } = require("../models/accountModels");


// Show list of portfolios //ÆNDRE
async function getPortfolios(req, res, next) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");
    const { accountID } = req.params;

    const portfolios = await Portfolio.getAllPortfolios(userID);
    req.portfolios = portfolios; // saves the portfolios to the req object
    next(); // express function to call the next middleware in accountRoute
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

    const { accountID, portfolioID } = req.params;

    const portfolio = await Portfolio.findPortfolioByID(portfolioID); 
    if (!portfolio) 
      return res.status(404).send("Portfolio not found")
      console.log(portfolio)

    const account = await Account.findAccountByID(accountID)
    console.log(account)

    if (!account) {
      console.log("Account not found for ID:", accountID);
      return res.status(404).send("Account not found");
    }
    const holdings = await Portfolio.getHoldings(portfolioID);
    const acquisitionPrice = await Portfolio.calculateAcquisitionPrice(portfolioID);
    let totalRealizedValue = 0;
    let totalUnrealizedGain = 0;

  //For loop that loops through 
    for (const h of holdings) {
      const expected = await Portfolio.calculateRealizedValue(portfolioID, h.Ticker);
      const gain = await Portfolio.calculateUnrealizedGain(portfolioID, h.Ticker);
      const gak = await Portfolio.calculateGAK(portfolioID, h.Ticker);

      h.realizedValue = expected !== null ? expected : 0;
      h.unrealizedGain = gain !== null ? gain : 0;
      h.gak = gak !== null ? gak : 0;;

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

    const gak = await Portfolio.calculateGAK(portfolioID, Ticker);
    const realizedValue = await Portfolio.calculateExpectedValue(portfolioID, Ticker);
    const unrealizedGain = await Portfolio.calculateUnrealizedGain(portfolioID, Ticker);

    res.render("portfolioAnalysis", { portfolio, Ticker, gak, realizedValue, unrealizedGain });
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
