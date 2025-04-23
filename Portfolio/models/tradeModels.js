const { connectToDB } = require("../database");

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
    static async createTrade({portfolioID, accountID, stockID, tradeType, quantity, price, fee, totalCost, date}) {
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
        .input("date", sql.DateTime, date)
        .query(`
            INSERT INTO Trade (portfolioID, accountID, stockID, tradeType, quantity, price, fee, totalPrice, tradeDate)
            OUTPUT INSERTED.tradeID
            VALUES (@portfolioID, @accountID, @stockID, @tradeType, @quantity, @price, @fee, @totalPrice, @date)
        `);

        return result.recordset[0].tradeID; //return the tradeID of the newly created trade 
    }

    //check if the user has enough funds in the account 
    static async checkFunds(accountID, totalCost) {
        const pool = await connectToDB();

        const result = await pool.request()
        .input("accountID", sql.Int, accountID)
        .query(`
            SELECT balance
            FROM account
            WHERE accountID = @accountID
            `);

        if (result.recordset.length === 0) {
            console.error("account not found");
        }
        const balance = result.recordset[0].balance; //get the balance of the account
        return balance >= totalCost; //check if the balance is greater than or equal to the total cost of the trade 
    }

    static async checkHoldings(portfolioID, stockID, quantity) {
        const pool = await connectToDB();
       
        const result =await pool.request()
        .input("portfolioID", sql.Int, portfolioID)
        .input("stockID", sql.Int, stockID)
        .query(`
            SELECT SUM(quantity) AS totalQuantity
            FROM Trade
            WHERE portfolioID = @portfolioID AND stockID = @stockID AND tradeType = 'buy'`
        );
    
        if (result.recordset.length === 0) {
            console.error("portfolio or stock not found");
        }
        const totalQuantity = result.recordset[0].totalQuantity; //get the total quantity of the stock in the portfolio
        return totalQuantity >= quantity; //check if the total quantity is greater than or equal to the quantity of the trade 
    }
}


module.exports = {
    Trade
 };