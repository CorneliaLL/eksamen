const { getAllPortfolios, findPortfolioByID, createNewPortfolio, calculateGAK, calculateExpectedValue,
  calculateUnrealizedGain, getHoldings } = require("../models/portfolioModels");



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

    const portfolios = await getAllPortfolios(userID); 
    
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
    const portfolio = await findPortfolioByID(portfolioID);

    if (!portfolio) {
      return res.status(404).send("Portfolio not found");
    }

    const holdings = await getHoldings(portfolioID);  //Fetch holdings for the portfolio

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

    const { accountID, portfolioName } = req.body;
    const registrationDate = new Date();

    await createNewPortfolio({ userID, accountID, portfolioName, registrationDate});

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
    const portfolio = await findPortfolioByID(portfolioID);

    if (!portfolio) return res.status(404).send("Portfolio not found");

    if (portfolio.userID !== userID) {
      return res.status(403).send("Unauthorized");
    }

    const gak = await calculateGAK(portfolioID, stockID);
    const expectedValue = await calculateExpectedValue(portfolioID, stockID);
    const unrealizedGain = await calculateUnrealizedGain(portfolioID, stockID);

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
