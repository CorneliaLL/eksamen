//configures with mssql:
const sql = require("mssql")

//Variable which creates connection between our app and our database
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

async function connectToDB() {
    try {

  //Creates connection to our sql server through mssql
  //Await = will only continue if the connection to the DB has been made
  // Pool = connection pool. Creates and keeps connection to the DB
  // Handles and sends our SQL queries
      const pool = await sql.connect(config);
      console.log("Connected to Azure SQL");
      return pool;
    } catch (err) {
      console.error("Database connection failed:", err.message);
      throw err;
  }
}

module.exports = { 
  sql,
  connectToDB
};