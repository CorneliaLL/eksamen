const {connectToDB, sql } = require("../database");

class Transaction{
    constructor(transactionID, accountID, tradeID, amount, date){
        this.transactionID = transactionID;
        this.accountID = accountID;
        this.tradeID = tradeID;
        this.amount = amount;
        this.date = date;
    }
    //async function that registers a transaction in the DB
    async registerTransaction() {
        const pool = await connectToDB();

        //create a new transaction in the DB
        const result = await pool.request()
        .input("accountID", sql.Int, accountID)
        .input("tradeID", sql.Int, tradeID)
        .input("amount", sql.Decimal(10, 2), amount)
        .input("date", sql.DateTime, date)
        .query(`
        INSERT INTO Transactions (accountID, tradeID, amount, date)
        VALUES (@accountID, @tradeID, @amount, @date)
        `);

        // update the account balance in the DB
        const updateResult = await pool.request()
        .input("accountID", sql.Int, accountID)
        .input("amount", sql.Decimal(10, 2), amount)
        .query(`
        UPDATE Accounts
        SET balance = balance + @amount
        WHERE accountID = @accountID
        `);
    }

    //Async function that gets all transaktion of a user
    static async getTransactions(accountID) {
        const pool = await connectToDB();

        const result = await pool.request()
        .input("accountID", sql.Int, accountID)
        .query(`
            SELECT 
                Transactions.transactionID, 
                Transactions.accountID, 
                Transaction.tradeID, 
                Transaction.amount, 
                Transaction.date, 
                Trade.stockID, 
                Trade.tradeType
            FROM Transactions
            JOIN Trades ON Transactions.tradeID = Trades.tradeID
            WHERE Transactions.accountID = @accountID
            `);

        return result.recordset; //return all transactions of the user
    }

}

module.exports = { Transaction };