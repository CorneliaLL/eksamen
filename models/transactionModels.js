class Transaction {
  constructor(transactionID, accountID, tradeID, amount, transactionDate = new Date()) {
    this.transactionID = transactionID;
    this.accountID = accountID;
    this.tradeID = tradeID;
    this.amount = amount;
    this.transactionDate = transactionDate;
  }

  async registerTransaction() {
    try {
      const pool = await connectToDB();
      await pool.request()
        .input("accountID", sql.Int, this.accountID)
        .input("tradeID", sql.Int, this.tradeID)
        .input("amount", sql.Decimal(18, 2), this.amount)
        .input("transactionDate", sql.DateTime, this.transactionDate)
        .query(`
          INSERT INTO Transactions (accountID, tradeID, amount, transactionDate)
          VALUES (@accountID, @tradeID, @amount, @transactionDate)
        `);

      await pool.request()
        .input("accountID", sql.Int, this.accountID)
        .input("amount", sql.Decimal(18, 2), this.amount)
        .query(`
          UPDATE Accounts
          SET balance = balance + @amount
          WHERE accountID = @accountID
        `);
    } catch (err) {
      console.error("Error in registerTransaction (object):", err.message);
      throw err;
    }
  }
}
