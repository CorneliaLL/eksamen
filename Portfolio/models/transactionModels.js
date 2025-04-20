const {connectToDB, sql } = require("../database");

class Transaction{
    constructor(transactionID, accountID, tradeID, amount, date){
        this.transactionID = transactionID;
        this.accountID = accountID;
        this.tradeID = tradeID;
        this.amount = amount;
        this.date = date;
    }
}

//async function that registers a transaction in the DB
async function registerTransaction({accountID, tradeID, amount, date}) {
    const pool = await connectToDB();

    //create a new transaction in the DB
    const result = await pool.request()
    .input("accountID", sql.Int, accountID)
    .input("tradeID", sql.Int, tradeID)
    .input("amount", sql.Decimal(10, 2), amount)
    .input("transactionDate", sql.DateTime, date)
    .query(`
      INSERT INTO Transactions (accountID, tradeID, amount, transactionDate)
      VALUES (@accountID, @tradeID, @amount, @transactionDate)
    `);

    // update the account balance in the DB
    const updateResult = await pool.request()
    .input("accountID", sql.Int, accountID)
    .input("amount", sql.Decimal(10, 2), amount)
    .query(`
      UPDATE Account
      SET balance = balance + @amount
      WHERE accountID = @accountID
    `);
}

//Async function that gets all transaktion of a user
async function getTransactions(accountID) {
    const pool = await connectToDB();

    const result = await pool.request()
    .input("accountID", sql.Int, accountID)
    .query(`
        SELECT transactionID, accountID, tradeID, amount, transactionDate, stockID, tradeType)
        FFROM Transactions
        JOIN Trade ON Transactions.tradeID = Trade.tradeID
        WHERE Transactions.accountID = @accountID
        `);

    return result.recordset; //return all transactions of the user
}

module.exports = { registerTransaction };