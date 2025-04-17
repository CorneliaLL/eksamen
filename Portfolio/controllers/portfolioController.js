const {Portfolio, getPortfoliosByUserID, findPortfolioByID, createNewPortfolio, calculateGAK,
calculateExpectedValue, calculateUnrealizedGain} = require("../models/portfolioModels");

// Create a new account
async function createPortfolio(req, res) {
    try {
      const {userID, accountID, portfolioName } = req.body;
      const registrationDate = new Date();
  
      await createNewPortfolio({ userID, accountID, portfolioName, registrationDate })
  
      res.send("/portfolioDashboard");
    } catch (err) {
      console.error("Error creating portfolio:", err.message);
      res.status(500).send("Failed to create portfolio");
    }
  }


module.exports = {
createPortfolio }
