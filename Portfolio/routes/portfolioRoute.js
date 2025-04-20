const express = require("express");
const router = express.Router();

const portfolioController = require("../controllers/portfolioController");


router.get("/portfolio", portfolioController.getPortfolios);
router.get("/:portfolioID", portfolioController.getPortfolioByID);

router.get("/createPortfolio", (req, res) => {
  res.render("createPortfolio");
});

router.post("/createPortfolio", portfolioController.handleCreatePortfolio);



router.get("/portfolioAnalysis/:portfolioID/:stockID", portfolioController.showPortfolioAnalysis)


module.exports = router;