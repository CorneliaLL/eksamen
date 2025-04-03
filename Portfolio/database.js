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
    
}