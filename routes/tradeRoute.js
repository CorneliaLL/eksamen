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
//note: ticker data gennem server ikke frontend
//trade registrerer ikke stocks køb  

//search for stock data 
router.get("/search", loadSearchView)
router.post("/search", handleStockSearch);

// handle the trade form submission
router.post("/trade", handleTrade);

module.exports = router;
