const express = require("express");
const router = express.Router();
const { handleTrade } = require("../controllers/tradeController");
const { handleStockSearch, loadSearchView } = require("../controllers/stockController");


// show the trade form to the user
router.get('/trade', (req, res) => {
    res.render('trade', {
      stockData: null, 
      error: null,
      success: null
    });
  });

//ny endpoint: post: search stock - gennem services 
//note: ticker sendes fra server via stockData, ikke fra brugerinput direkte
//bemærk: Trade-POST handler om selve handlen, ikke om at hente ny stockdata
//search for stock data 
router.post("/search", handleStockSearch);

// handle the trade form submission
router.post("/trade", handleTrade);

module.exports = router;
