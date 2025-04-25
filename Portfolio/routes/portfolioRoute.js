const express = require("express");
const router = express.Router();

const portfolioController = require("../controllers/portfolioController");
const { Account } = require("../models/accountModels");


router.get('/createPortfolio', async (req, res) => {
  try{
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");
    
    const accounts = await Account.getAllAccounts(userID);
    console.log("Accounts being sent to EJS:", accounts);
    res.render('createPortfolio', { accounts }); 
  } catch (err) {
    res.status(500).send("Failed to fetch accounts");
  }
});
router.get("/portfolio/:portfolioID", portfolioController.getPortfolioByID);
router.post("/createPortfolio", portfolioController.handleCreatePortfolio);

router.get("/portfolioAnalysis/:portfolioID/:stockID", portfolioController.showPortfolioAnalysis)


module.exports = router;