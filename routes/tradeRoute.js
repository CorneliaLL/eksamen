const express = require("express");
const router = express.Router();
const { handleTrade } = require("../controllers/tradeController");
const { handleStockSearch } = require("../controllers/stockController");


router.get('/trade', handleTrade)
router.get("/trade/:portfolioID/:accountID", handleStockSearch);


router.post("/search", handleStockSearch);
router.post("/trade/:portfolioID/:accountID", handleStockSearch);
router.post("/trade", handleTrade);

module.exports = router;