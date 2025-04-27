const { connectToDB, sql } = require("../database");

class Trade{
    constructor(tradeID, portfolioID, accountID, stockID, tradeType, quantity, price){
        this.tradeID = tradeID;
        this.portfolioID = portfolioID;
        this.accountID = accountID;
        this.stockID = stockID;
        this.tradeType = tradeType;
        this.quantity = quantity;
        this.price = price;
    }

    //Async function that creates a trade in the db
    static async createTrade({portfolioID, accountID, stockID, tradeType, quantity, price, fee, totalPrice, tradeDate}) {
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

        return result.recordset[0].tradeID; //return the tradeID of the newly created trade 
    }

    //check if the user has enough funds in the account 
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
                return false; // Return false if the account does not exist
            }
    
            const balance = result.recordset[0].balance; // Get the balance of the account
            if (balance === null || balance === undefined) {
                console.error(`Balance is undefined for account ID ${accountID}.`);
                return false;
            }
    
            return balance >= totalCost; // Check if the balance is sufficient
        } catch (err) {
            console.error("Error checking funds:", err.message);
            return false; // Return false in case of an error
        }
    }

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
                return false; // Return false if no holdings exist
            }
    
            const currentQuantity = result.recordset[0].quantity;
            return currentQuantity >= quantity; // Check if holdings are sufficient
        } catch (err) {
            console.error("Error checking holdings:", err.message);
            return false; // Return false in case of an error
        }
    }
}

module.exports = {
    Trade
 };