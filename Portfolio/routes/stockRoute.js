const express = require('express');
const router = express.Router();
const { storeStockData} = require('../services/fetchStockData.js');
//imports function that gets stock data

//endpoint to get stocks 
router.get('/fetchStock/:ticker', async (req, res) => {
    const { ticker } = req.params; //gets ticker from URL
    await storeStockData(ticker);
    res.send(`Stock data for ${ticker} is updated`);
});

//endpoint for chart 
router.get('/chart/:ticker', async (req, res) => {
    try {
        const { ticker } = req.params;
        const { recordset } = await sql.query`
            SELECT Date, ClosePrice FROM Stocks
            WHERE Ticker = ${ticker}
            ORDER BY Date ASC
        `;

        res.render('stockChart', { //ejs-file 
            ticker,
            dates: recordset.map(r => r.Date.toISOString().split('T')[0]), //For hver række (r) i dataen: Tag datoen, lav den om til tekst (toISOString()), og tag kun dato-delen før T (fordi en ISO-dato ser ud som "2024-04-20T00:00:00.000Z")
            prices: recordset.map(r => r.ClosePrice) //For hver række (r): Tag lukkeprisen (close price) ud
        }); //data for graph 
    } catch (err) {
        console.error('Fejl:', err);
        res.status(500).send('Noget gik galt');
    }
});

//list of all stocks 
router.get('/list', async (req, res) => {
    try {
        const result = await sql.query`
            SELECT Ticker, Date, ClosePrice FROM Stocks
            ORDER BY Ticker, Date DESC
        `;

        res.render('stockList', { stocks: result.recordset }); //shows ejs-file for stockdata
    } catch (error) {
        console.error('Cannot get stock list:', error);
        res.status(500).send('Cannot get stocks');
    }
});

module.exports = router; 

 

/*Kilder: aktiekurser 
**Server og routing:**
- Opsætning af server og ruter i Express.js er baseret på:
  - [Express.js Starter Guide](https://expressjs.com/en/starter/hello-world.html)
  - [Express.js Routing Guide](https://expressjs.com/en/guide/routing.html)

**API-forespørgsler:**
- Hentning af aktiedata fra Alpha Vantage API og håndtering af API-kald via Axios er baseret på:
  - [Alpha Vantage Documentation](https://www.alphavantage.co/documentation/)
  - [Axios Intro Documentation](https://axios-http.com/docs/intro)
  - [Axios Async/Await Example](https://axios-http.com/docs/example)

**Databaseforbindelse:**
- Forbindelse til Azure SQL database via Node.js mssql-pakken følger:
  - [Node-mssql Documentation](https://www.npmjs.com/package/mssql)
  - [Node-mssql Usage Documentation](https://www.npmjs.com/package/mssql#usage)

**Visualisering af aktiedata:**
- Kursudviklingen for aktier vises via grafiske fremstillinger med Chart.js baseret på:
  - [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
  - [Chart.js Line Chart Example](https://www.chartjs.org/docs/latest/charts/line.html)

Alle kilder er anvendt til at sikre korrekt opsætning af server, ruter, API, databaseforbindelse og frontend-visualisering.*/