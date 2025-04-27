const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stockController");


router.get('/fetchStock/:ticker', stockController.fetchStock);
router.get('/chart/:ticker', stockController.showChart);
router.get('/list', stockController.listStocks);
router.get('/api/stocks/:ticker', stockController.fetchSpecificStock);

router.post('/fetch', stockController.fetchStock);



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

---

Alle kilder er anvendt til at sikre korrekt opsætning af server, ruter, API-integration, databaseforbindelse og frontend-visualisering.*/