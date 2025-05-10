const { connectToDB, sql } = require("../database");

class Transaction {
  constructor(transactionID, accountID, tradeID, amount, transactionDate = new Date()) {
    this.transactionID = transactionID;
    this.accountID = accountID;
    this.tradeID = tradeID;
    this.amount = amount;
    this.transactionDate = transactionDate;
  }

    // Registrer en ny transaktion i databasen og opdater kontobalancen 
    //TransactionDate = new Date() så den sættes som nuværende dato og tid
    static async registerTransaction({ accountID, tradeID, amount, transactionDate = new Date() }) {
      try {
        const pool = await connectToDB();
  
        //Tilføjer en ny række i Transactions-tabellen med de givne værdier
        await pool.request()
          .input("accountID", sql.Int, accountID)
          .input("tradeID", sql.Int, tradeID)
          .input("amount", sql.Decimal(18, 2), amount)
          .input("transactionDate", sql.DateTime, transactionDate)
          .query(`
            INSERT INTO Transactions (accountID, tradeID, amount, transactionDate)  
            VALUES (@accountID, @tradeID, @amount, @transactionDate)
          `);
  
        // Opdaterer kontobalancen i Accounts-tabellen
        await pool.request()
          .input("accountID", sql.Int, accountID)
          .input("amount", sql.Decimal(18, 2), amount)
          .query(`
            UPDATE Accounts
            SET balance = balance + @amount
            WHERE accountID = @accountID
          `);
      } catch (err) {
        throw err; 
      }
    }
  
    //Metode som henter alle transaktioner for en given konto
    static async getTransactions(accountID) {
      try {
        const pool = await connectToDB();
  
        const result = await pool.request()
          .input("accountID", sql.Int, accountID)
          .query(`
            SELECT 
              Transactions.transactionID,  
              Transactions.accountID,
              Transactions.tradeID,
              Transactions.amount,
              Transactions.transactionDate,
              Trades.ticker, 
              Trades.tradeType
            FROM Transactions
            LEFT JOIN Trades ON Transactions.tradeID = Trades.tradeID -- LEFT JOIN får alle transaktioner, også dem uden tilknyttede handler (null-værdi)
            WHERE Transactions.accountID = @accountID
            ORDER BY Transactions.transactionDate DESC -- Sorterer så nyeste transaktioner kommer først
          `);
  
        return result.recordset;
      } catch (err) {
        throw err; 
      }
    }
  }
  
  module.exports = { Transaction };

