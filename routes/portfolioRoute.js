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



// API: Total portfolio value over time
router.get('/api/portfolio/total-value', async (req, res) => {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    const { sql } = require('../database');

    //sum of all stocks each day for users
    const result = await sql.query`
      SELECT Date, SUM(Closeprice) AS TotalValue
      FROM Stocks
      GROUP BY Date
      ORDER BY Date ASC
    `;

    const formattedData = result.recordset.map(row => ({
      date: row.Date,
      totalValue: row.TotalValue
    }));

    res.json(formattedData);

  } catch (error) {
    console.error('Fejl ved hentning af portfolio data:', error);
    res.status(500).send('Serverfejl');
  }
});

module.exports = router;