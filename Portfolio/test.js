//Test to check if the app is connected to our DB
const { connectToDB } = require("./database");

async function test() {
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

