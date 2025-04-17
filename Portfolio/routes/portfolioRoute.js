const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolioController");

router.get("/createPortfolio", portfolioController.createPortfolio);
router.post("/createPortfolio", portfolioController.createPortfolio);

module.exports = router;

