const { connectToDB, sql } = require("../database");

class Trade {
    constructor(tradeID, portfolioID, accountID, Ticker, stockName, tradeType, quantity, price) {
        this.tradeID = tradeID;
        this.portfolioID = portfolioID;
        this.accountID = accountID;
        this.Ticker = Ticker;
        this.stockName = stockName;
        this.tradeType = tradeType;
        this.quantity = quantity;
        this.price = price;
    }

    // Create a new trade
    static async createTrade({ portfolioID, accountID, Ticker, stockName, tradeType, quantity, price, fee, totalPrice, tradeDate }) {
        const pool = await connectToDB();

        const result = await pool.request()
            .input("portfolioID", sql.Int, portfolioID)
            .input("accountID", sql.Int, accountID)
            .input("Ticker", sql.NVarChar, Ticker)
            .input("stockName", sql.NVarChar, stockName)
            .input("tradeType", sql.NVarChar, tradeType)
            .input("quantity", sql.Int, quantity)
            .input("price", sql.Decimal(18, 4), price)
            .input("fee", sql.Decimal(18, 4), fee)
            .input("totalPrice", sql.Decimal(18, 4), totalPrice)
            .input("tradeDate", sql.DateTime, tradeDate)
            .query(`
                INSERT INTO Trades (portfolioID, accountID, Ticker, stockName, tradeType, quantity, price, fee, totalPrice, date)
                OUTPUT INSERTED.tradeID
                VALUES (@portfolioID, @accountID, @Ticker, @stockName, @tradeType, @quantity, @price, @fee, @totalPrice, @tradeDate)
            `);

        return result.recordset[0].tradeID;
    }

    // Check if enough funds available for a buy
    static async checkFunds(accountID, totalCost) {
        const pool = await connectToDB();
        const result = await pool.request()
            .input("accountID", sql.Int, accountID)
            .query(`SELECT balance FROM Accounts WHERE accountID = @accountID`);

        if (result.recordset.length === 0) return false;

        const balance = result.recordset[0].balance;
        return balance >= totalCost;
    }

    // Check if enough holdings available for a sell
    static async checkHoldings(portfolioID, Ticker, quantity) {
        const pool = await connectToDB();
        const result = await pool.request()
            .input("portfolioID", sql.Int, portfolioID)
            .input("Ticker", sql.NVarChar, Ticker)
            .query(`
                SELECT quantity FROM Holdings
                WHERE portfolioID = @portfolioID AND Ticker = @Ticker
            `);

        if (result.recordset.length === 0) return false;

        const currentQuantity = result.recordset[0].quantity;
        return currentQuantity >= quantity;
    }

    // Update holdings after a buy
    static async updateHoldingsAfterBuy(portfolioID, Ticker, quantity) {
        const pool = await connectToDB();
        const result = await pool.request()
            .input("portfolioID", sql.Int, portfolioID)
            .input("Ticker", sql.NVarChar, Ticker)
            .query(`SELECT quantity FROM Holdings WHERE portfolioID = @portfolioID AND Ticker = @Ticker`);

        if (result.recordset.length > 0) {
            const newQuantity = result.recordset[0].quantity + quantity;
            await pool.request()
                .input("portfolioID", sql.Int, portfolioID)
                .input("Ticker", sql.NVarChar, Ticker)
                .input("quantity", sql.Int, newQuantity)
                .query(`UPDATE Holdings SET quantity = @quantity WHERE portfolioID = @portfolioID AND Ticker = @Ticker`);
        } else {
            await pool.request()
                .input("portfolioID", sql.Int, portfolioID)
                .input("Ticker", sql.NVarChar, Ticker)
                .input("quantity", sql.Int, quantity)
                .query(`INSERT INTO Holdings (portfolioID, Ticker, quantity) VALUES (@portfolioID, @Ticker, @quantity)`);
        }
    }

    // Update holdings after a sell
    static async updateHoldingsAfterSell(portfolioID, Ticker, quantity) {
        const pool = await connectToDB();
        const result = await pool.request()
            .input("portfolioID", sql.Int, portfolioID)
            .input("Ticker", sql.NVarChar, Ticker)
            .query(`SELECT quantity FROM Holdings WHERE portfolioID = @portfolioID AND Ticker = @Ticker`);

        if (result.recordset.length > 0) {
            const currentQuantity = result.recordset[0].quantity;
            const newQuantity = currentQuantity - quantity;

            if (newQuantity > 0) {
                await pool.request()
                    .input("portfolioID", sql.Int, portfolioID)
                    .input("Ticker", sql.NVarChar, Ticker)
                    .input("quantity", sql.Int, newQuantity)
                    .query(`UPDATE Holdings SET quantity = @quantity WHERE portfolioID = @portfolioID AND Ticker = @Ticker`);
            } else {
                await pool.request()
                    .input("portfolioID", sql.Int, portfolioID)
                    .input("Ticker", sql.NVarChar, Ticker)
                    .query(`DELETE FROM Holdings WHERE portfolioID = @portfolioID AND Ticker = @Ticker`);
            }
        }
    }
}

module.exports = { Trade };
