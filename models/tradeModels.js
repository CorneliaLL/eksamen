const { connectToDB, sql } = require("../database");

class Trade {
    constructor(tradeID, portfolioID, accountID, ticker, stockName, tradeType, quantity, price) {
        this.tradeID = tradeID;
        this.portfolioID = portfolioID;
        this.accountID = accountID;
        this.ticker = ticker;
        this.stockName = stockName;
        this.tradeType = tradeType;
        this.quantity = quantity;
        this.price = price;
        this.fee = fee;
        this.totalPrice = totalPrice;
        this.tradeDate = tradeDate;
    }

    // Create a new trade record in the database
    static async createTrade({ portfolioID, accountID, stockID, ticker, stockName, tradeType, quantity, price, fee, totalPrice, tradeDate }) {
        const pool = await connectToDB();

        console.log("stop")
        console.log({portfolioID, accountID, ticker, stockName, tradeType, quantity, price, fee, totalPrice, tradeDate})

        const result = await pool.request()
            .input("portfolioID", sql.Int, portfolioID)
            .input("accountID", sql.Int, accountID)
            .input("stockID", sql.Int, stockID)
            .input("ticker", sql.NVarChar, ticker)
            .input("tradeType", sql.NVarChar, tradeType)
            .input("quantity", sql.Int, quantity)
            .input("price", sql.Decimal(18, 4), price)
            .input("fee", sql.Decimal(18, 4), fee)
            .input("totalPrice", sql.Decimal(18, 4), totalPrice)
            .input("tradeDate", sql.DateTime, tradeDate)
            .query(`
                INSERT INTO Trades (portfolioID, accountID, stockID, ticker, tradeType, quantity, price, fee, totalPrice, tradeDate)
                OUTPUT INSERTED.tradeID
                VALUES (@portfolioID, @accountID, @stockID, @ticker, @tradeType, @quantity, @price, @fee, @totalPrice, @tradeDate)
            `);

        return result.recordset[0].tradeID;
    }

    // Check if there are enough funds to buy
    static async checkFunds(accountID, totalCost) {
        const pool = await connectToDB();
        const result = await pool.request()
            .input("accountID", sql.Int, accountID)
            .query(`SELECT balance FROM Accounts WHERE accountID = @accountID`);

        if (result.recordset.length === 0) return false;

        const balance = result.recordset[0].balance;
        return balance >= totalCost;
    }

    // Check if there are enough holdings to sell
    static async checkHoldings(portfolioID, ticker, quantity) {
        const pool = await connectToDB();
        const result = await pool.request()
            .input("portfolioID", sql.Int, portfolioID)
            .input("ticker", sql.NVarChar, ticker)
            .query(`
                SELECT quantity FROM Holdings
                WHERE portfolioID = @portfolioID AND ticker = @ticker
            `);

        if (result.recordset.length === 0) return false;

        const currentQuantity = result.recordset[0].quantity;
        return currentQuantity >= quantity;
    }

    // Update holdings after a trade. Either add or remove the quantity based on the trade type
    //quantity change is positive for buy and negative for sell
    static async adjustHoldings(portfolioID, ticker, quantityChange, stockID) {
        const pool = await connectToDB();

        //check if the holding exist    
        const result = await pool.request()
            .input("portfolioID", sql.Int, portfolioID)
            .input("ticker", sql.NVarChar, ticker)
            .query(`
                SELECT quantity FROM Holdings
                WHERE portfolioID = @portfolioID AND ticker = @ticker
            `);

        // if the holding exist, update the quantity    
        if (result.recordset.length > 0) {
            const currentQuantity = result.recordset[0].quantity;
            const newQuantity = currentQuantity + quantityChange; // add or subtract trade quantity
            
            // update the quantity if its still positive 
            if (newQuantity > 0) {
                await pool.request()
                    .input("portfolioID", sql.Int, portfolioID)
                    .input("ticker", sql.NVarChar, ticker)
                    .input("quantity", sql.Int, newQuantity)
                    .query(`
                        UPDATE Holdings
                        SET quantity = @quantity
                        WHERE portfolioID = @portfolioID AND ticker = @ticker
                    `);
            // if the quantity is 0 or less, delete the holding 
            } else {
                await pool.request()
                    .input("portfolioID", sql.Int, portfolioID)
                    .input("ticker", sql.NVarChar, ticker)
                    .query(`
                        DELETE FROM Holdings
                        WHERE portfolioID = @portfolioID AND ticker = @ticker
                    `);
            }
        } else {
            // Insert a new holding if buying and the holding doesnt exist
            // if the quantity is positive, insert a new holding
            if (quantityChange > 0) {
                await pool.request()
                    .input("portfolioID", sql.Int, portfolioID)
                    .input("ticker", sql.NVarChar, ticker)
                    .input("quantity", sql.Int, quantityChange)
                    .input("stockID", sql.Int, stockID)
                    .query(`
                        INSERT INTO Holdings (portfolioID, ticker, quantity, stockID)
                        VALUES (@portfolioID, @ticker, @quantity, @stockID)
                    `);
            }
        }
    }
}

module.exports = { Trade };
