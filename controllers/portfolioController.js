const { Portfolio } = require("../models/portfolioModels");
const { Account } = require("../models/accountModels");

// Vis alle porteføljer for en bruger 
async function getPortfolios(req, res, next) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    const portfolios = await Portfolio.getAllPortfolios(userID);

    let totalAcquisitionPrice = 0;
    let totalRealizedValue = 0;
    let totalUnrealizedGain = 0;

    // Beregning af anskaffelsespris, realiseret værdi og urealiseret gevinst for hver portfølje 
    for (const p of portfolios) {
      p.acquisitionPrice = await Portfolio.calculateAcquisitionPrice(p.portfolioID);
      totalAcquisitionPrice += p.acquisitionPrice || 0;

    //Looper gennem holdings for at beregne realiseret værdi og urealiseret gevinst
      const holdings = await Portfolio.getHoldings(p.portfolioID);
      for (const h of holdings) {
        const realizedValue = await Portfolio.calculateRealizedValue(p.portfolioID, h.ticker);
        const unrealizedGain = await Portfolio.calculateUnrealizedGain(p.portfolioID, h.ticker);
        totalRealizedValue += realizedValue || 0;
        totalUnrealizedGain += unrealizedGain || 0;
      }
    }

    // Tilføj beregnede værdier til portføljerne for at vise dem i UI
    req.portfolios = portfolios;
    req.totalAcquisitionPrice = totalAcquisitionPrice;
    req.totalRealizedValue = totalRealizedValue;
    req.totalUnrealizedGain = totalUnrealizedGain;

    next(); // Bruger next() til at gå videre til næste route-handler 
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to fetch portfolios");
  }
}


// Vis portfølje med ID for detaljeret portfolio-side
async function getPortfolioByID(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    const { accountID, portfolioID } = req.params;

    const portfolio = await Portfolio.findPortfolioByID(portfolioID);
    if (!portfolio)
      return res.status(404).send("Portfolio not found"); // returnerer 404 hvis porteføljen ikke findes 

    console.log(portfolio);

    const account = await Account.findAccountByID(accountID); // Henter konto med den bestemte accountID
    console.log(account);

    if (!account) {
      console.log("Account not found for ID:", accountID);
      return res.status(404).send("Account not found");
    }

    const holdings = await Portfolio.getHoldings(portfolioID); // Henter alle holdings for den bestemte portefølje
    const acquisitionPrice = await Portfolio.calculateAcquisitionPrice(portfolioID); // Henter anskaffelsesprisen for porteføljen

    let totalRealizedValue = 0;
    let totalUnrealizedGain = 0;

    // Loop through holdings to compute realized and unrealized values
    // looper gennem holdings for at beregne realiseret værdi og urealiseret gevinst
    // tilføjer værdierne til totalRealizedValue og totalUnrealizedGain
    for (const h of holdings) {
      const expected = await Portfolio.calculateRealizedValue(portfolioID, h.ticker); // Henter den realiserede værdi for hver holding
      const gain = await Portfolio.calculateUnrealizedGain(portfolioID, h.ticker); // Henter den urealiserede gevinst for hver holding
      const gak = await Portfolio.calculateGAK(portfolioID, h.ticker); // Henter gennemsnitsanskaffelsesprisen for hver holding (GAK)

    
      h.realizedValue = expected !== null ? expected : 0; 
      h.unrealizedGain = gain !== null ? gain : 0;
      h.gak = gak !== null ? gak : 0;

      // Summering af realiseret værdi og urealiseret gevinst for alle holdings 
      totalRealizedValue += h.realizedValue;
      totalUnrealizedGain += h.unrealizedGain;
    }

    // render portefølje med alle holdings og deres værdier 
    console.log("Holdings:", holdings);
    res.render("portfolio", {
      portfolio,
      holdings,
      account,
      acquisitionPrice,
      totalRealizedValue,
      totalUnrealizedGain,
      stockID: holdings.stockID,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to fetch portfolio");
  }
}

// Vis oprettelsesformular for ny portefølje 
// Henter alle konti for den pågælgende bruger for at kunne vælge en konto til porteføljen 
async function renderCreatePortfolio(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    const accounts = await Account.getAllAccounts(userID);
    res.render('createPortfolio', { accounts });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to fetch accounts");
  }
}


// Behandler oprettelse af en ny portfolio, mens renderCreatePortfolio viser formularen
// Henter kontoID og porteføljenavn fra formularen og opretter en ny portefølje samt registreringsdato
async function handleCreatePortfolio(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    const { accountID, portfolioName } = req.body;
    const account = await Account.findAccountByID(accountID);
    if (!account) return res.status(400).send("Invalid account ID");

    const registrationDate = new Date(); // Registreringsdato sættes til nuværende dato
    const portfolio = new Portfolio(null, accountID, portfolioName, registrationDate);
    const portfolioID = await portfolio.createNewPortfolio({ accountID, portfolioName, registrationDate });
 
    res.redirect(`/portfolio/${portfolioID}`); // Redirect til den oprettede portefølje 
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to create portfolio");
  }
}

// Henter porteføljeID og aktietciker, og beregner GAK, realiseret værdi og urealiseret gevinst for den specifikke aktie i porteføljen 
// Bruges til at vise detaljeret analyse af en aktie i porteføljen 
async function showPortfolioAnalysis(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    const { portfolioID, stockSymbol } = req.params; 
    const portfolio = await Portfolio.findPortfolioByID(portfolioID); // Henter portefølje med det specifikke ID

    // tjekker om porteføljen findes og om brugeren ejer den 
    if (!portfolio) return res.status(404).send("Portfolio not found"); 
    if (portfolio.userID !== userID) return res.status(403).send("Unauthorized");

    // Henter aktieoplysninger for den specifikke aktie i porteføljen 
    const gak = await Portfolio.calculateGAK(portfolioID, stockSymbol);
    const realizedValue = await Portfolio.calculateRealizedValue(portfolioID, stockSymbol);
    const unrealizedGain = await Portfolio.calculateUnrealizedGain(portfolioID, stockSymbol);

    res.render("portfolioAnalysis", { portfolio, stockSymbol, gak, realizedValue, unrealizedGain }); // Sender data til visning i UI 
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to show analysis");
  }

}

// Henter grafdata for porteføljen baseret på proteføljeID
async function getPortfolioGraphData(req, res) {
  const { portfolioID } = req.params;
  try {
    const raw = await Portfolio.getAllStocksPriceHistory(portfolioID);

    // Gruppér data efter ticker
    const seriesMap = {};

    raw.forEach(row => {
      const ticker = row.ticker;
      if (!seriesMap[ticker]) seriesMap[ticker] = [];

      seriesMap[ticker].push({
        date: row.priceDate.toISOString().split('T')[0], 
        price: parseFloat(row.price)
      });
    });

    res.json(seriesMap); // fx { AAPL: [...], MSFT: [...] }
  } catch (err) {
    console.error('Fejl i grafdata:', err);
    res.status(500).json({ error: 'Serverfejl' });
  }
}

module.exports = {
  getPortfolios,
  getPortfolioByID,
  renderCreatePortfolio,
  handleCreatePortfolio,
  showPortfolioAnalysis,
  getPortfolioGraphData
}