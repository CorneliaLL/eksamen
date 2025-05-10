const { Portfolio } = require("../models/portfolioModels");
const { Account } = require("../models/accountModels");
const { Stocks, PriceHistory } = require("../models/stockModels");

// Vis alle porteføljer for en bruger 
async function getPortfolios(req, res, next) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

  //Henter accountID fra URL
  //Bruger ternary expression til at tjekke om accountID findes i URL'en
  //Hvis det gør, konverteres værdien til et heltal, ellers sættes det lig null
  //På denne måde kan vi bruge funktionen til at hente alle porteføljer for en bruger men også separere dem ud fra accountID
    const accountID = req.params.accountID ? parseInt(req.params.accountID, 10) : null;
    let portfolios = await Portfolio.getAllPortfolios(userID);

    //Hvis accountID er angivet, filtreres porteføljerne for at vise dem som tilhører den respektive konto
    if (accountID) {
      portfolios = portfolios.filter(p => p.accountID === accountID); // filterer efter 
    }
    
    let totalAcquisitionPrice = 0;
    let totalRealizedValue = 0;
    let totalUnrealizedGain = 0;

    // Beregning af anskaffelsespris, realiseret værdi og urealiseret gevinst for hver portfølje 
    //For-loop gennem hver portefølje for beregningerne 
    for (const p of portfolios) {
      p.acquisitionPrice = await Portfolio.calculateAcquisitionPrice(p.portfolioID);
      totalAcquisitionPrice += p.acquisitionPrice || 0;

    //Henter holdings i porteføljen og looper igennem for at beregne totalerne
    const holdings = await Portfolio.getHoldings(p.portfolioID);
    for (const h of holdings) {
      totalRealizedValue += h.realizedValue || 0;
      totalUnrealizedGain += h.unrealizedGain || 0;
    }
    
    }

    // Gemmer resultaterne i req-objekt til bruge i frontend
    req.portfolios = portfolios;
    req.totalAcquisitionPrice = totalAcquisitionPrice;
    req.totalRealizedValue = totalRealizedValue;
    req.totalUnrealizedGain = totalUnrealizedGain;

    next(); // Bruger next() for at næste funktion kan kaldes i router
  } catch (err) {
    res.status(500).send("Failed to fetch portfolios");
  }
}


// Henter information om specifik portefølje
async function getPortfolioByID(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    // Henter portefølje og kontoID fra URL
    const { accountID, portfolioID } = req.params;

    //Henter portefølje baseret på ID
    const portfolio = await Portfolio.findPortfolioByID(portfolioID);
    if (!portfolio)
      return res.status(404).send("Portfolio not found"); // returnerer 404 hvis porteføljen ikke findes 

    //Henter konto knyttet til porteføljen 
    const account = await Account.findAccountByID(accountID);

    if (!account) {
      return res.status(404).send("Account not found");
    }

    // Henter alle holdings og anskaffelsesprisen for den bestemte portefølje
    const holdings = await Portfolio.getHoldings(portfolioID); 
    const acquisitionPrice = await Portfolio.calculateAcquisitionPrice(portfolioID);

    let totalRealizedValue = 0;
    let totalUnrealizedGain = 0;

    // looper gennem holdings for at beregne realiseret værdi og urealiseret gevinst
    for (const h of holdings) {
      const expected = await Portfolio.calculateRealizedValue(portfolioID, h.ticker);
      const gain = await Portfolio.calculateUnrealizedGain(portfolioID, h.ticker); 
      const gak = await Portfolio.calculateGAK(portfolioID, h.ticker); 
      const priceInfo = await PriceHistory.getPriceInfo(h.ticker);
      const dbStock = await Stocks.findStockByTicker(h.ticker); 

      // tilføjer værdierne til totalRealizedValue og totalUnrealizedGain i holdings
      h.realizedValue = expected !== null ? expected : 0; 
      h.unrealizedGain = gain !== null ? gain : 0;
      h.gak = gak !== null ? gak : 0;
      h.currentPrice = priceInfo?.price ?? null;
      h.dailyChange = priceInfo?.dailyChange ?? null; // TILFØJET
      h.stockCurrency = dbStock?.stockCurrency ?? null; // TILFØJET

      // Summering af realiseret værdi og urealiseret gevinst for alle holdings 
      totalRealizedValue += h.realizedValue;
      totalUnrealizedGain += h.unrealizedGain;
    }

    // render portefølje med alle holdings og deres værdier
    res.render("portfolio", {
      portfolio,
      holdings,
      account,
      acquisitionPrice,
      totalRealizedValue,
      totalUnrealizedGain,
      stockID: holdings.stockID
    });
  } catch (err) {
    res.status(500).send("Failed to fetch portfolio");
  }
}

// Render oprettelsesformular for ny portefølje 
async function renderCreatePortfolio(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    // Henter alle konti for den pågælgende bruger for at kunne vælge en konto til porteføljen 
    const accounts = await Account.getAllAccounts(userID);
    res.render('createPortfolio', { accounts });
  } catch (err) {
    res.status(500).send("Failed to fetch accounts");
  }
}


// Behandler oprettelse af en ny portfolio, mens renderCreatePortfolio viser formularen
async function handleCreatePortfolio(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    // Henter kontoID og porteføljenavn fra formularen og opretter en ny portefølje samt registreringsdato
    const { accountID, portfolioName } = req.body;
    const account = await Account.findAccountByID(accountID);
    if (!account) return res.status(400).send("Invalid account ID");

    //Opretter ny portefølje
    const registrationDate = new Date(); //Nuværende tidspunkt
    const portfolio = new Portfolio(null, accountID, portfolioName, registrationDate);
    const portfolioID = await portfolio.createNewPortfolio({ accountID, portfolioName, registrationDate });
 
    // Redirect til den oprettede portefølje 
    res.redirect(`/portfolio/${portfolioID}`);
  } catch (err) {
    res.status(500).send("Failed to create portfolio");
  }
}


// Henter grafdata for porteføljens udvikling over tid baseret på porteføljeID 
async function getPortfolioGraphData(req, res) {
  const { portfolioID } = req.params;
  try {
    //Henter historiske priser for alle aktier i porteføljen
    const raw = await Portfolio.getAllStocksPriceHistory(portfolioID);

    const holdings = await Portfolio.getHoldings(portfolioID);


    // Opretter en liste af prisændringer over tid 
    const seriesMap = {};

    //Oversætter månedskoder til navne 
    const months = {
      "2025-01": "January",
      "2025-02": "Febuary",
      "2025-03": "March",
      "2025-04": "April",
      "2025-05": "May",
      "2025-06": "June",
    }

    // Organiserer prisdata i seriesMap efter ticker
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
    
    let resultArray = []
    holdings.forEach(holding => {
      const holdingHistory = seriesMap[holding.ticker];
      const monthlyAggregate = {};
    
      holdingHistory.forEach(entry => {
        const yearMonth = entry.date.slice(0, 7); // e.g. "2025-01"
        const monthName = months[yearMonth];
    
        if (!monthName) return;
    
        const value = holding.quantity * entry.price;
    
        if (!monthlyAggregate[monthName]) {
          monthlyAggregate[monthName] = 0;
        }
    
        monthlyAggregate[monthName] += value;
      });
    
      // Oprette en array hvor hver position svarer til en månedsværdi 
      resultArray = monthOrder.map(month => monthlyAggregate[month] || 0);
      });
    
    // Returnerer data i jsonformat 
    return res.json(resultArray)

  } catch (err) {
    res.status(500).json({ error: 'Serverfejl' });
  }
}

module.exports = {
  getPortfolios,
  getPortfolioByID,
  renderCreatePortfolio,
  handleCreatePortfolio,
  getPortfolioGraphData,
}