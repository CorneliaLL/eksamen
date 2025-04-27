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

(async () => {
    try {
        await sql.connect(config);
        const rate = await storeExchangeRate('USD', 'DKK');
        console.log('Gemte valutakurs:', rate);
    } catch (err) {
        console.error('Fejl:', err.message);
    }
})();

console.log('test');