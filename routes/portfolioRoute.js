const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolioController");
const accountController = require("../controllers/accountController");



router.get('/createPortfolio', portfolioController.renderCreatePortfolio);
router.get("/portfolio", portfolioController.getPortfolios, accountController.getAccountByID);
router.get("/portfolio/:portfolioID/:accountID", portfolioController.getPortfolioByID);
router.get("/portfolioAnalysis/:portfolioID/:stockSymbol", portfolioController.showPortfolioAnalysis);

router.post("/createPortfolio", portfolioController.handleCreatePortfolio);

module.exports = router;
