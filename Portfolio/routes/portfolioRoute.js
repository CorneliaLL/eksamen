const express = require("express");
const router = express.Router();

const {
  getPortfolios,
  getPortfolioByID,
  handleCreatePortfolio,
  showPortfolioAnalysis
} = require("../controllers/portfolioController");

// Viser liste over brugerens porteføljer
router.get("/", getPortfolios);

// Viser form til oprettelse (ekstra route hvis ønsket separat)
router.get("/create", async (req, res) => {
  const userID = req.session.userID;
  if (!userID) return res.redirect("/");

  const { getAccountsByUserID } = require("../models/accountModels");
  const accounts = await getAccountsByUserID(userID);
  res.render("createPortfolio", { accounts });
});

// Håndterer formularen (POST)
router.post("/create", handleCreatePortfolio);

// Viser én portefølje
router.get("/:portfolioID", getPortfolioByID);

// Analyse for en bestemt aktie i en portefølje
router.get("/:portfolioID/stock/:stockID", showPortfolioAnalysis);

module.exports = router;
