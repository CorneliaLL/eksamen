const { Portfolio } = require("../models/portfolioModels");
const { Account } = require("../models/accountModels");



// Show list of all portfolios for the logged-in user
async function getPortfolios(req, res) {
  try {
    console.log("Session data:", req.session); // Debugging: Check session data
    const userID = req.session.userID; // Access userID from session

    // Check if the user is logged in
    if (!userID) {
      console.log("User not logged in"); 
      return res.status(401).send("Unauthorized");
    }

    const portfolios = await Portfolio.getAllPortfolios(userID); 
    
    return res.render("portfolio.ejs", { portfolios });

  } catch (err) {
    res.status(500).send("Failed to fetch portfolios");
  }
}


// Show one portfolio by ID
async function getPortfolioByID(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    const { portfolioID } = req.params;
    const portfolio = await Portfolio.findPortfolioByID(portfolioID);

    if (!portfolio) {
      return res.status(404).send("Portfolio not found");
    }

    const holdings = await Portfolio.getHoldings(portfolioID);  //Fetch holdings for the portfolio

    res.render("portfolioDetail", { portfolio, holdings });

  } catch (err) {
    console.error("Error fetching portfolio:", err.message);
    res.status(500).send("Failed to fetch portfolio");
  }
}

async function handleCreatePortfolio(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");
    const account = await Account.getAccountsByUserID(userID);

    const { accountID, portfolioName } = req.body;
    const registrationDate = new Date();

    const portfolio = new Portfolio(null, accountID, portfolioName, registrationDate);
    await portfolio.createNewPortfolio({ accountID, portfolioName, registrationDate});

    res.redirect("/portfolio"); // After creating, go back to overview

  } catch (err) {
    console.error("Error creating portfolio:", err.message);
    res.status(500).send("Failed to create portfolio");
  }
}

// Portfolio analysis for one stock
async function showPortfolioAnalysis(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    const { portfolioID, stockID } = req.params;
    const portfolio = await Portfolio.findPortfolioByID(portfolioID);

    if (!portfolio) return res.status(404).send("Portfolio not found");
//Changed from userID to accountID!!!! Is that alright?
    if (portfolio.accountID !== accountID) {
      return res.status(403).send("Unauthorized");
    }

    const gak = await Portfolio.calculateGAK(portfolioID, stockID);
    const expectedValue = await Portfolio.calculateExpectedValue(portfolioID, stockID);
    const unrealizedGain = await Portfolio.calculateUnrealizedGain(portfolioID, stockID);

    res.render("portfolioAnalysis", {
      portfolio, stockID, gak, expectedValue, unrealizedGain });

  } catch (err) {
    console.error("Error showing portfolio analysis:", err.message);
    res.status(500).send("Failed to show analysis");
  }
}

module.exports = {
  getPortfolios,
  getPortfolioByID,
  handleCreatePortfolio,
  showPortfolioAnalysis
}
