const { connectToDB, sql } = require("../database");

class Account {
  constructor(accountID, userID, accountName, currency, balance, registrationDate, accountStatus, bankID, deactivationDate) {
    this.accountID = accountID;
    this.userID = userID;
    this.accountName = accountName; 
    this.currency = currency;
    this.balance = balance;
    this.registrationDate = registrationDate;
    this.accountStatus = accountStatus;
    this.bankID = bankID;
    this.deactivationDate = deactivationDate;
  }

//Metode der opretter en ny konto i databasen
async createNewAccount({ userID, accountName, currency, balance, registrationDate, accountStatus, bankID }) {
  const pool = await connectToDB();

  await pool.request()
    .input("userID", sql.Int, userID)
    .input("accountName", sql.NVarChar, accountName)
    .input("currency", sql.VarChar, currency)
    .input("balance", sql.Decimal(18, 2), balance)
    .input("registrationDate", sql.DateTime, registrationDate)
    .input("accountStatus", sql.Bit, accountStatus)
    .input("bankID", sql.Int, bankID)
    .query(`
      INSERT INTO Accounts (userID, currency, balance, registrationDate, accountStatus, bankID, accountName)
      VALUES (@userID, @currency, @balance, @registrationDate, @accountStatus, @bankID, @accountName)
    `);
}

//Sætter accountStatus lig 0 (false) så kontoen er deaktiveret
//Sætter deactivationDate til den nuværende dato og tid med datetime
static async deactivateAccount(accountID, deactivationDate) {
  const pool = await connectToDB();

  return await pool.request()
    .input("accountID", sql.Int, accountID)
    .input("deactivationDate", sql.DateTime, deactivationDate) 
    .query(`
      UPDATE Accounts
      SET accountStatus = 0,
          deactivationDate = @deactivationDate
      WHERE accountID = @accountID
    `);
}

//Sætter accountStatis lig 1 (true) så kontoen er aktiv
//Fjerner deactivationDate og sætter den til null
static async reactivateAccount(accountID) {
  const pool = await connectToDB();

  return await pool.request()
    .input("accountID", sql.Int, accountID)
    .query(`
      UPDATE Accounts
      SET accountStatus = 1, deactivationDate = NULL
      WHERE accountID = @accountID
    `);
}

//Metode der finder en konto i databasen ved at matche accountID
static async findAccountByID(accountID) {
  const pool = await connectToDB();

  const result = await pool.request()
    .input("accountID", sql.Int, accountID)
    .query(`
      SELECT * FROM Accounts 
      WHERE accountID = @accountID
    `);
    return result.recordset[0];
}

//Metode der henter alle konti tilhørende en bruger i databasen, matcher med userID
static async getAllAccounts(userID) {
  const pool = await connectToDB();

  const result = await pool.request()
    .input("userID", sql.Int, userID)
    .query(`
      SELECT * FROM Accounts
      WHERE userID = @userID
    `);
  //Returnerer alle konti tilhørende en bruger
    return result.recordset;
    
}

//Opdaterer saldoen på en konto med UPDATE forespørgsel
static async updateAccountBalance(accountID, changedBalance){
  const pool = await connectToDB();
  
  const result = await pool.request()
    .input("accountID", sql.Int, accountID)
    .input("balance", sql.Decimal(18, 2), changedBalance)
    .query(`
      UPDATE Accounts
      SET balance = balance + @balance
      WHERE accountID = @accountID`)

    //Returnerer resultatet af forespørgslen hvis én eller flere rækker er opdateret
    //Hvis dette er tilfældet, returneres true
      return result.rowsAffected[0] > 0;
  }
}

module.exports = {
  Account
};