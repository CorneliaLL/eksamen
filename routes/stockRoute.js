const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stockController");

router.get('/api/stocks/:ticker', stockController.handleGetStockByTicker);


module.exports = router;
