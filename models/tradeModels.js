const { connectToDB, sql } = require("../database");

class Trade {
    constructor(tradeID, portfolioID, accountID, stockID, tradeType, quantity, price) {
        this.tradeID = tradeID;
        this.portfolioID = portfolioID;
        this.accountID = accountID;
        this.stockID = stockID;
        this.tradeType = tradeType;
        this.quantity = quantity;
        this.price = price;
    }

    // Async function to create a new trade in the Trades table
    static async createTrade({ portfolioID, accountID, stockID, tradeType, quantity, price, fee, totalPrice, tradeDate }) {
        const pool = await connectToDB();
        
        const result = await pool.request()
            .input("portfolioID", sql.Int, portfolioID)
            .input("accountID", sql.Int, accountID)
            .input("stockID", sql.Int, stockID)
            .input("tradeType", sql.NVarChar, tradeType)
            .input("quantity", sql.Int, quantity)
            .input("price", sql.Decimal(18, 2), price)
            .input("fee", sql.Decimal(18, 2), fee)
            .input("totalPrice", sql.Decimal(18, 2), totalPrice)
            .input("tradeDate", sql.DateTime, tradeDate)
            .query(`
                INSERT INTO Trades (portfolioID, accountID, stockID, tradeType, quantity, price, fee, totalPrice, tradeDate)
                OUTPUT INSERTED.tradeID
                VALUES (@portfolioID, @accountID, @stockID, @tradeType, @quantity, @price, @fee, @totalPrice, @tradeDate)
            `);

        return result.recordset[0].tradeID; // Return the newly created trade ID
    }

    // Check if the user has enough funds in their account before a BUY
    static async checkFunds(accountID, totalCost) {
        const pool = await connectToDB();
    
        try {
            const result = await pool.request()
                .input("accountID", sql.Int, accountID)
                .query(`
                    SELECT balance
                    FROM Accounts
                    WHERE accountID = @accountID
                `);

            if (result.recordset.length === 0) {
                console.error(`Account with ID ${accountID} not found.`);
                return false;
            }

            const balance = result.recordset[0].balance;
            if (balance === null || balance === undefined) {
                console.error(`Balance is undefined for account ID ${accountID}.`);
                return false;
            }

            return balance >= totalCost;
        } catch (err) {
            console.error("Error checking funds:", err.message);
            return false;
        }
    }

    // Check if the user has enough holdings before a SELL
    static async checkHoldings(portfolioID, stockID, quantity) {
        const pool = await connectToDB();
    
        try {
            const result = await pool.request()
                .input("portfolioID", sql.Int, portfolioID)
                .input("stockID", sql.Int, stockID)
                .query(`
                    SELECT quantity
                    FROM Holdings
                    WHERE portfolioID = @portfolioID AND stockID = @stockID
                `);

            if (result.recordset.length === 0) {
                console.error(`No holdings found for portfolio ID ${portfolioID} and stock ID ${stockID}.`);
                return false;
            }

            const currentQuantity = result.recordset[0].quantity;
            return currentQuantity >= quantity;
        } catch (err) {
            console.error("Error checking holdings:", err.message);
            return false;
        }
    }

    // Update holdings after a BUY: add quantity or insert a new holding
    static async updateHoldingsAfterBuy(portfolioID, stockID, quantity) {
        const pool = await connectToDB();

        const result = await pool.request()
            .input("portfolioID", sql.Int, portfolioID)
            .input("stockID", sql.Int, stockID)
            .query(`
                SELECT quantity
                FROM Holdings
                WHERE portfolioID = @portfolioID AND stockID = @stockID
            `);

        if (result.recordset.length > 0) {
            // If holding exists, update quantity
            const newQuantity = result.recordset[0].quantity + quantity;
            await pool.request()
                .input("portfolioID", sql.Int, portfolioID)
                .input("stockID", sql.Int, stockID)
                .input("quantity", sql.Int, newQuantity)
                .query(`
                    UPDATE Holdings
                    SET quantity = @quantity
                    WHERE portfolioID = @portfolioID AND stockID = @stockID
                `);
        } else {
            // If holding does not exist, insert new holding
            await pool.request()
                .input("portfolioID", sql.Int, portfolioID)
                .input("stockID", sql.Int, stockID)
                .input("quantity", sql.Int, quantity)
                .query(`
                    INSERT INTO Holdings (portfolioID, stockID, quantity)
                    VALUES (@portfolioID, @stockID, @quantity)
                `);
        }
    }

    // Update holdings after a SELL: subtract quantity or delete holding if quantity is 0
    static async updateHoldingsAfterSell(portfolioID, stockID, quantity) {
        const pool = await connectToDB();

        const result = await pool.request()
            .input("portfolioID", sql.Int, portfolioID)
            .input("stockID", sql.Int, stockID)
            .query(`
                SELECT quantity
                FROM Holdings
                WHERE portfolioID = @portfolioID AND stockID = @stockID
            `);

        if (result.recordset.length > 0) {
            const currentQuantity = result.recordset[0].quantity;
            const newQuantity = currentQuantity - quantity;

            if (newQuantity > 0) {
                // Update quantity
                await pool.request()
                    .input("portfolioID", sql.Int, portfolioID)
                    .input("stockID", sql.Int, stockID)
                    .input("quantity", sql.Int, newQuantity)
                    .query(`
                        UPDATE Holdings
                        SET quantity = @quantity
                        WHERE portfolioID = @portfolioID AND stockID = @stockID
                    `);
            } else {
                // Delete holding if no quantity left
                await pool.request()
                    .input("portfolioID", sql.Int, portfolioID)
                    .input("stockID", sql.Int, stockID)
                    .query(`
                        DELETE FROM Holdings
                        WHERE portfolioID = @portfolioID AND stockID = @stockID
                    `);
            }
        }
    }
}

module.exports = {
    Trade
};
