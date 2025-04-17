const express = require("express");
const router = express.Router();

const {
  getPortfolios,
  getPortfolioByID,
  handleCreatePortfolio,
  showPortfolioAnalysis
} = require("../controllers/portfolioController");


router.get("/portfolio", getPortfolios);
router.get("/:portfolioID", getPortfolioByID);

router.get("/createPortfolio", (req, res) => {
  res.render("createPortfolio");
});

router.post("/createPortfolio", handleCreatePortfolio);



router.get("portfolioAnalysis/:portfolioID", showPortfolioAnalysis)


module.exports = router;
