const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolioController");

router.get("/portfolio/create", portfolioController.createPortfolio);
router.post("/portfolio/create", portfolioController.createPortfolio);

module.exports = router;

