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

const { storeStockData } = require('./services/fetchStockData'); // Ret stien så den passer til din mappe!

(async () => {
    try {
        const result = await storeStockData('AAPL'); // Test med f.eks. 'AAPL' for Apple
        console.log('Result:', result);
    } catch (err) {
        console.error('Test error:', err.message);
    }
})();
