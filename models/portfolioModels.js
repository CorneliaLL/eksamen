const { connectToDB, sql } = require("../database");
const { fetchStockData } = require("../services/fetchStockData");

// opretter en porteølje klasse med ID, kontoID, porteføæjenavn og registreringsdato
class Portfolio {
  constructor(portfolioID, accountID, portfolioName, registrationDate) {
    this.portfolioID = portfolioID;
    this.accountID = accountID;
    this.portfolioName = portfolioName;
    this.registrationDate = registrationDate;
  }

  // Metode til at oprette en ny portefølje i databasen 
  async createNewPortfolio({ accountID, portfolioName, registrationDate }) {
    const pool = await connectToDB(); // opretter forbindelse til databasen 
    const result = await pool.request() // opretter en forespørgsel til databsen 
      .input("accountID", sql.Int, accountID)
      .input("portfolioName", sql.NVarChar, portfolioName)
      .input("registrationDate", sql.DateTime, registrationDate)
      .query(`
        INSERT INTO Portfolios (accountID, portfolioName, registrationDate)
        OUTPUT INSERTED.portfolioID -- returnerer det oprettede portfolioID
        VALUES (@accountID, @portfolioName, @registrationDate)
      `);
    return result.recordset[0].portfolioID;
  }

  // Metode til at hente alle porteføljer for en given bruger ved at bruge userID som paramterer

  static async getAllPortfolios(userID) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("userID", sql.Int, userID)
      .query(`
        SELECT * 
        FROM Portfolios
        JOIN Accounts ON Portfolios.accountID = Accounts.accountID -- joiner Portfolios og Accounts tabellerne for at få kontoinformationer
        WHERE Accounts.userID = @userID
      `);
    return result.recordset;
  }

  // Find en specifik portefølje ved hjælp af portfolioID
  static async findPortfolioByID(portfolioID) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .query(`
        SELECT Portfolios.*, Accounts.userID  
        FROM Portfolios
        JOIN Accounts ON Portfolios.accountID = Accounts.accountID  -- Vi bruger JOIN til at koble Portfolios-tabellen sammen med Accounts-tabellen baseret på accountID, så vi kan tilgå userID fra Accounts.
        WHERE Portfolios.portfolioID = @portfolioID
      `);
    return result.recordset[0] || null;
  }

  // metode til at beregne GAK (gennemsnitlig anskaffelsespris) for en given aktie i porteføljen 
  // Bruger portfolio ID og ticker som paramtre for at finde aktien i databasen 
  // GAK beregnes ved at tage summen af pris*mængde for køb og dividere med summen af mængden af aktier 
  static async calculateGAK(portfolioID, ticker) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .input("ticker", sql.NVarChar, ticker)
      .query(`
        SELECT
          SUM(price * quantity) AS totalCost,  -- Beregner den samlede omkostning ved køb af aktier
          SUM(quantity) AS totalQuantity   -- Beregner den samlede mængde aktier købt 
        FROM Trades --  Vi bruger Trades-tabellen til at finde købstransaktioner for den specifikke aktie i porteføljen
        WHERE portfolioID = @portfolioID AND Ticker = @ticker AND tradeType = 'buy' -- Specificerer at vi kun vil have købstransaktioner 
      `);
      
     // Henter den samlede omkostning og mængde fra vores forespørgsel  
    const { totalCost, totalQuantity } = result.recordset[0]; 
    if (!totalCost || !totalQuantity || totalQuantity === 0) return null;

    //returnerer GAK 
    return totalCost / totalQuantity;
  }


  // Beregn anskaffelsesprisen (acquisition price) for en given portefølje
  static async calculateAcquisitionPrice(portfolioID) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .query(`
        SELECT
          SUM(price * quantity) AS totalCost
        FROM Trades
        WHERE portfolioID = @portfolioID AND tradeType = 'buy'
      `);

    const { totalCost } = result.recordset[0];
    return totalCost;
  }

  // Bereng realiseret værdi (nuværende værdi) baseret på live pris fra API
  static async calculateRealizedValue(portfolioID, ticker) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .input("ticker", sql.NVarChar, ticker)
      .query(`
        SELECT SUM(quantity) AS totalQuantity   -- Beregner samlede mængde aktier i porteføljen 
        FROM Trades
        WHERE portfolioID = @portfolioID AND Ticker = @ticker 
      `);

    const { totalQuantity } = result.recordset[0];
    if (!totalQuantity || totalQuantity === 0) return 0;

    // Henter aktiekurs fra API 
    // FetchStockData er en funktion der henter aktiekursen fra vores API
    const stockData = await fetchStockData(ticker);
    const currentPrice = parseFloat(stockData.closePrice); 

    return parseFloat((totalQuantity * currentPrice).toFixed(2));
  }

  // Beregner urealiseret gevinst for en given aktie i porteføljen
  static async calculateUnrealizedGain(portfolioID, ticker) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .input("ticker", sql.NVarChar, ticker)
      .query(`
        SELECT
          SUM(price * quantity) AS totalCost,
          SUM(quantity) AS totalQuantity
        FROM Trades
        WHERE portfolioID = @portfolioID AND Ticker = @ticker
      `);

    const { totalCost, totalQuantity } = result.recordset[0];
    if (!totalCost || !totalQuantity || totalQuantity === 0) return 0;

    const stockData = await fetchStockData(ticker); // Henter aktiekurs fra API
    const currentPrice = parseFloat(stockData.closePrice); // Konverterer til float

    // Beregner realiseret værdi og urealiseret gevinst 
    const realizedValue = totalQuantity * currentPrice;
    const unrealizedGain = realizedValue - totalCost;

    return parseFloat(unrealizedGain.toFixed(2)); 
  }

  // Get all holdings (distinct tickers) in portfolio
  // Beregner GAK, realiseret værdi og urealiseret gevinst for hver aktie i porteføljen
  // Returnerer en liste med aktier og deres tilhørende værdier
  static async getHoldings(portfolioID) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .query(`
      SELECT Ticker, 
      SUM(CASE WHEN tradeType = 'buy' THEN quantity ELSE -quantity END) AS quantity   --Bruger case-sætning til at beregne den samlede mængde aktier i porteføljen udfra køb og salg
      FROM Trades
      WHERE portfolioID = @portfolioID
      GROUP BY Ticker  -- Grupperer resultaterne efter ticker for at få unikke aktier og undgå dubletter 
      HAVING SUM(CASE WHEN tradeType = 'buy' THEN quantity ELSE -quantity END) > 0   -- HAVING SUM bruges til at filtrere resultaterne og kun vise aktier med en positiv mængde, fremfor WHERE som ville filtrere før gruppering 
      `);

    const holdings = [];  // Opretter et tomt array til at gemme aktierne og deres værdier
    
    // iterer over aktierne og henter GAK, realiseret værdi og urealiseret gevinst for hver aktie 
    for (let stock of result.recordset) {
      const ticker = stock.Ticker; 
      const quantity = stock.quantity;

      const gak = await Portfolio.calculateGAK(portfolioID, ticker); 
      const realizedValue = await Portfolio.calculateRealizedValue(portfolioID, ticker);
      const unrealizedGain = await Portfolio.calculateUnrealizedGain(portfolioID, ticker);

      // tilføjer aktien og dens værdier til holdings arrayet
      holdings.push({ Ticker: ticker, quantity, gak, realizedValue, unrealizedGain });
    }
    return holdings;
  }

  // Henter aktiehistorik for en given aktie i en portefølje 
  // Bruges til at vise aktiehistorik i UI
  static async getPriceHistory(stockID) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("stockID", sql.Int, stockID)
      .query(`
        SELECT TOP 30 price, priceDate  -- Henter de seneste 30 priser og datoer for aktien 
        FROM Pricehistory
        WHERE stockID = @stockID
        ORDER BY priceDate DESC   -- Sorterer efter dato i faldende rækkefølge for at få de nyeste priser først 
      `); 
    return result.recordset;
  }
  
  // Henter aktiehistorik for alle aktier i en portefølje 
  static async getAllStocksPriceHistory(portfolioID) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("portfolioID", sql.Int, portfolioID)
      .query(`
        SELECT S.Ticker, PH.priceDate, PH.price  
        FROM Trades T
        JOIN Stocks S ON T.stockID = S.StockID  -- Joiner Trades og Stocks tabellerne for at få aktieoplysninger
        JOIN PriceHistory PH ON PH.stockID = S.StockID   -- Joiner PriceHistory tabellen for at få prisoplysninger
        WHERE T.portfolioID = @portfolioID
        ORDER BY S.Ticker, PH.priceDate ASC  -- Sorterer efter ticker og dato i stigende rækkefølge
      `);
  
    return result.recordset; // fx 100 rækker med Ticker, priceDate, price
  }
}

module.exports = {
  Portfolio
};