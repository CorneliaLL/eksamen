const { connectToDB, sql } = require("../database");

class Account {
  constructor(accountID, userID, name, currency, balance, registrationDate, accountStatus, bankID) {
    this.accountID = accountID;
    this.userID = userID;
    this.name = name; 
    this.currency = currency;
    this.balance = balance;
    this.registrationDate = registrationDate;
    this.accountStatus = accountStatus;
    this.bankID = bankID;
  }
}


// Insert a new account into the database
async function createAccount({ userID, name, currency, balance, registrationDate, accountStatus, bankID }) {
  const pool = await connectToDB();

  await pool.request()
    .input("userID", sql.Int, userID)
    .input("name", sql.NVarChar, name)
    .input("currency", sql.VarChar, currency)
    .input("balance", sql.Decimal(18, 2), balance)
    .input("registrationDate", sql.DateTime, registrationDate)
    .input("accountStatus", sql.Bit, accountStatus)
    .input("bankID", sql.Int, bankID)
    .query(`
      INSERT INTO Accounts (userID, name, currency, balance, registrationDate, accountStatus, bankID)
      VALUES (@userID, @name, @currency, @balance, @registrationDate, @accountStatus, @bankID)
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
  

module.exports = {
  Account,
  getAllAccounts,
  createAccount,
  deactivateAccount,
  reactivateAccount
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

module.exports = { Account };