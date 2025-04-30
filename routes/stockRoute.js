//stockRoute defines endpoints for frontend, which controller is used (url), routes are organised and seperated from logic 

const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stockController");


/*router.get('/fetchStock/:ticker', stockController.fetchStock);*/ //post? gets stockdata from AV api and saves in db based on ticker from url 
router.get('/chart/:ticker', stockController.showChart); //to show graph 
router.get('/list', stockController.listStocks); //shows all stocks in db
router.get('/api/stocks/:ticker', stockController.fetchSpecificStock); //gets stockdata as json (api)
router.post('/fetchStock', stockController.fetchStock); //gets stockdata from AV api and saves in db based on ticker and portfolioID in req.body



module.exports = router;

//Define the route to get stock data app.get('/stock/:symbol', getStockData); ????

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

---

Alle kilder er anvendt til at sikre korrekt opsætning af server, ruter, API-integration, databaseforbindelse og frontend-visualisering.*/