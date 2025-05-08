const { connectToDB, sql } = require("../database");

class Transaction {
  constructor(transactionID, accountID, tradeID, amount, transactionDate = new Date()) {
    this.transactionID = transactionID;
    this.accountID = accountID;
    this.tradeID = tradeID;
    this.amount = amount;
    this.transactionDate = transactionDate;
  }

    // Registrer en ny transaction i databasen og opdater kontobalancen 
    static async registerTransaction({ accountID, tradeID, amount, transactionDate = new Date() }) {
      try {
        const pool = await connectToDB();
  
        // Indsætter en ny række i Transactions-tabellen
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
        console.error("Error in registerTransaction:", err.message);
        throw err; 
      }
    }
  
    // Henter alle transaktioner for en given konto
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
            LEFT JOIN Trades ON Transactions.tradeID = Trades.tradeID -- LEFT JOIN får alle transaktioner, både trades og almindelige
            WHERE Transactions.accountID = @accountID
            ORDER BY Transactions.transactionDate DESC -- Sorterer så nyeste transaktioner kommer først
          `);
  
        return result.recordset;
      } catch (err) {
        console.error("Error in getTransactions:", err.message);
        throw err; 
      }
    }
  }
  
  module.exports = { Transaction };

