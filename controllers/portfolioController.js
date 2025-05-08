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
      totalRealizedValue += h.realizedValue || 0;
      totalUnrealizedGain += h.unrealizedGain || 0;
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


// Henter grafdata for porteføljen baseret på proteføljeID
async function getPortfolioGraphData(req, res) {
  const { portfolioID } = req.params;
  try {
    const raw = await Portfolio.getAllStocksPriceHistory(portfolioID);

    // get users portfolio
    const holdings = await Portfolio.getHoldings(portfolioID);

    console.log({holdings})



    // now we have price histor AND portfoio
    // Give me an agrugated history of the portfolio


    // Gruppér data efter ticker
    const seriesMap = {};

    const months = {
      "2025-01": "January",
      "2025-02": "Febuary",
      "2025-03": "March",
      "2025-04": "April",
      "2025-05": "May",
      "2025-06": "June",
    }

    raw.forEach(row => {
      const ticker = row.ticker;
      if (!seriesMap[ticker]) seriesMap[ticker] = [];

      seriesMap[ticker].push({
        date: row.priceDate.toISOString().split('T')[0], 
        price: parseFloat(row.price),
        ticker: ticker,
      });
    });

    const monthOrder = ["January", "Febuary", "March", "April", "May", "June"];
    const monthKeys = Object.keys(months); // ["2025-01", "2025-02", ..., "2025-06"]
    
    let resultArray = []
    holdings.forEach(holding => {
      const holdingHistory = seriesMap[holding.ticker];
      const monthlyAggregate = {};
    
      holdingHistory.forEach(entry => {
        const yearMonth = entry.date.slice(0, 7); // e.g. "2025-01"
        const monthName = months[yearMonth];
    
        if (!monthName) return;
    
        // If we divide value by the number og days in THAT month the value will actually make sense
        //need to know the days of very month to do it. not in the middle of the month
        const value = holding.quantity * entry.price;
    
        if (!monthlyAggregate[monthName]) {
          monthlyAggregate[monthName] = 0;
        }
    
        monthlyAggregate[monthName] += value;
      });
    
      // Create positional array
      resultArray = monthOrder.map(month => monthlyAggregate[month] || 0);
    
      console.log(`Positional monthly values for ${holding.ticker}:`, resultArray);
    });
    

    return res.json(resultArray)

    res.json(seriesMap); // fx { AAPL: [...], MSFT: [...] }
  } catch (err) {
    console.error('Fejl i grafdata:', err);
    res.status(500).json({ error: 'Serverfejl' });
  }
}

//pie chart
async function getPortfolioPieData(req, res) {
  const { portfolioID } = req.params;
  try {
    console.log("Fetching pie data for portfolio:", portfolioID);

    const holdings = await Portfolio.getHoldings(portfolioID);

    console.log("Holdings received:", holdings);

    const labels = holdings.map(h => h.ticker);
    const data = holdings.map(h => h.quantity);

    console.log("Pie chart labels:", labels);
    console.log("Pie chart data:", data);

    res.json({ labels, data });
  } catch (err) {
    console.error("Fejl ved piechart-data:", err); // Dette viser dig den præcise fejl i terminalen
    res.status(500).json({ error: "Serverfejl" });
  }
}





module.exports = {
  getPortfolios,
  getPortfolioByID,
  renderCreatePortfolio,
  handleCreatePortfolio,
  getPortfolioGraphData,
  getPortfolioPieData
}