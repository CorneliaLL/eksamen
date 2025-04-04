//Test to check if the app is connected to our DB
const { connectToDB } = require("./database");

async function test() {
  const pool = await connectToDB(); // ← vil logge besked her
}
test();
