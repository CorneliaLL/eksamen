const { connectToDB, sql } = require("../database");

class Account {
  constructor(accountID, userID, accountName, currency, balance, registrationDate, accountStatus, bankID) {
    this.accountID = accountID;
    this.userID = userID;
    this.accountName = accountName; 
    this.currency = currency;
    this.balance = balance;
    this.registrationDate = registrationDate;
    this.accountStatus = accountStatus;
    this.bankID = bankID;
  }
}


// Insert a new account into the database
async function createNewAccount({ userID, accountName, currency, balance, registrationDate, accountStatus, bankID }) {
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

// set accountStatus to 0 for deactivating
async function deactivateAccount(accountID) {
  const pool = await connectToDB();

  return await pool.request()
    .input("accountID", sql.Int, accountID)
    .query(`
      UPDATE Accounts
      SET accountStatus = 0
      WHERE accountID = @accountID
    `);
}

// Set accountStatus to 1 (reactivate the account)
async function reactivateAccount(accountID) {
    const pool = await connectToDB();
  
    return await pool.request()
      .input("accountID", sql.Int, accountID)
      .query(`
        UPDATE Accounts
        SET accountStatus = 1
        WHERE accountID = @accountID
      `);
  }
  
  async function findAccountByID(accountID) {
    const pool = await connectToDB();

    const result = await pool.request()
      .input("accountID", sql.Int, accountID)
      .query(`
        SELECT * FROM Accounts 
        WHERE accountID = @accountID
      `);
      return result.recordset[0];
  }

//Async function which fetches all accounts from one user from the DB
  async function getAllAccounts(userID) {
    const pool = await connectToDB();

    const result = await pool.request()
      .input("userID", sql.Int, userID)
      .query(`
        SELECT * FROM Accounts
        WHERE userID = @userID
      `);
    //Returns the whole list
      return result.recordset;
  }

module.exports = {
  Account,
  createNewAccount,
  deactivateAccount,
  reactivateAccount,
  findAccountByID,
  getAllAccounts
};



/* 
createAccount
funktioner:
editAccount()
deactivateAccount
reopenAccount
insertAmount
withdrawAmount
*/