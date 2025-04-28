const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolioController");
const { Account } = require("../models/accountModels");

// Form to create new portfolio
router.get('/createPortfolio', async (req, res) => {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    const accounts = await Account.getAllAccounts(userID);
    res.render('createPortfolio', { accounts });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to fetch accounts");
  }
});

// Routes
router.get("/portfolio", portfolioController.getPortfolios);
router.get("/portfolio/:portfolioID", portfolioController.getPortfolioByID);
router.post("/createPortfolio", portfolioController.handleCreatePortfolio);
router.get("/portfolioAnalysis/:portfolioID/:stockSymbol", portfolioController.showPortfolioAnalysis);

module.exports = router;
