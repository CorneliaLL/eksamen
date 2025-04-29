const { connectToDB, sql } = require("../database");

class Transaction {
    constructor(transactionID, accountID, tradeID, amount, transactionDate) {
        this.transactionID = transactionID;
        this.accountID = accountID;
        this.tradeID = tradeID;
        this.amount = amount;
        this.transactionDate = transactionDate;
    }

    // Registers a new transaction in the db and updates the account balance
    async registerTransaction() {
        const pool = await connectToDB();

        // Create a new transaction record
        await pool.request()
            .input("accountID", sql.Int, this.accountID)
            .input("tradeID", sql.Int, this.tradeID)
            .input("amount", sql.Decimal(18, 2), this.amount) // using 18,4 for better precision
            .input("transactionDate", sql.DateTime, this.date)
            .query(`
                INSERT INTO Transactions (accountID, tradeID, amount, transactionDate)
                VALUES (@accountID, @tradeID, @amount, @transactionDate)
            `);
//EVT. ændre amount til balance for at holde det ensartet
        // Update accounts balance
        await pool.request()
            .input("accountID", sql.Int, this.accountID)
            .input("amount", sql.Decimal(18, 2), this.amount)
            .query(`
                UPDATE Accounts
                SET balance = balance + @amount
                WHERE accountID = @accountID
            `);
    }

//EVt ku samle account transaktioner i denne metode sammen med ens stock transaktioner
    // Fetches all transactions and trade details related to a specific account
    static async getTransactions(accountID) {
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
                    Trades.Ticker, 
                    Trades.tradeType
                FROM Transactions
                JOIN Trades ON Transactions.tradeID = Trades.tradeID
                WHERE Transactions.accountID = @accountID
            `);

        return result.recordset; // returns all transactions for the given account
    }
}

module.exports = { Transaction };
