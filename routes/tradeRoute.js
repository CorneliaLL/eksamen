const express = require("express");
const router = express.Router();
const { handleTrade } = require("../controllers/tradeController");
const { handleStockSearch } = require("../controllers/stockController");


router.get('/trade/:portfolioID/:accountID', handleTrade)
router.get("/trade/:portfolioID/:accountID/stocksearch", handleStockSearch);


router.post("/search", handleStockSearch);
router.post("/trade/:portfolioID/:accountID/stocksearch", handleStockSearch);
router.post("/trade/:portfolioID/:accountID", handleTrade);

module.exports = router;