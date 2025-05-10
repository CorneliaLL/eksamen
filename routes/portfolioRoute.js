const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolioController");
const accountController = require("../controllers/accountController");

router.get('/createPortfolio', portfolioController.renderCreatePortfolio);
router.get("/portfolio", portfolioController.getPortfolios, accountController.getAccountByID);
router.get("/portfolio/:portfolioID/:accountID", portfolioController.getPortfolioByID);
router.get('/api/portfolio/:portfolioID/graph', portfolioController.getPortfolioGraphData);
router.get("/stock-chart/:ticker", (req, res) => {
    res.render('stockChart', { ticker: req.params.ticker });
});

router.post("/createPortfolio", portfolioController.handleCreatePortfolio);

module.exports = router;
