//Test to check if the app is connected to our DB
//const { connectToDB } = require("./database");

/*async function test() {
  const pool = await connectToDB(); // ← vil logge besked her
}
test();


app.get('/test-session', (req, res) => {
  if (!req.session.testdata) {
    req.session.testdata = "hello session";
    res.send("Session sat.");
  } else {
    res.send("Session virker: " + req.session.testdata);
  }
});

*/

const { sql } = require('./database');
const { storeExchangeRate } = require('./services/fetchExchangeRate');
const { storeStockData } = require('./services/fetchStockData'); // Ret stien så den passer til din mappe!

const config = {
  user: "celina",
  password: "Fes65pkj",
  server: "invest-app.database.windows.net",
  database: "invest-app",
  options: {
      encrypt: true, // necessary for azure
      trustServerCertificate: false
    },
};
/*
const { Stocks } = require('./models/stockModels');

(async () => {
    try {
        await Stocks.storeStock(
            'AAPL', 
            'Apple Inc', 
            new Date(), 
            'USD', 
            165.30, 
            null, 
            'Common Stock'
        );
        console.log("Stock inserted successfully!");
    } catch (err) {
        console.error("Error inserting stock:", err.message);
    }
})();
*/
