const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolioController");
const accountController = require("../controllers/accountController");
const stockController = require('../controllers/stockController');



router.get('/createPortfolio', portfolioController.renderCreatePortfolio);
router.get("/portfolio", portfolioController.getPortfolios, accountController.getAccountByID);
router.get("/portfolio/:portfolioID/:accountID", portfolioController.getPortfolioByID);
router.get("/portfolioAnalysis/:portfolioID/:stockSymbol", portfolioController.showPortfolioAnalysis);
router.get("/stock-chart/:ticker", (req, res) => {
    res.render('stockChart', { ticker: req.params.ticker });
});
router. get('/stocks/api/:ticker', stockController.getStockPriceHistory);

router.post("/createPortfolio", portfolioController.handleCreatePortfolio);

module.exports = router;
