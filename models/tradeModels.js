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

    //Metode der opretter en ny handel i databasen
    static async createTrade({ portfolioID, accountID, stockID, ticker, stockName, tradeType, quantity, price, fee, totalPrice, tradeDate }) {
        const pool = await connectToDB();
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

    //Metode der checker om der er nok penge på en konto
    //Bruges når man skal købe aktier
    static async checkFunds(accountID, totalCost) {
        const pool = await connectToDB();
        const result = await pool.request()
            .input("accountID", sql.Int, accountID)
            .query(`SELECT balance FROM Accounts WHERE accountID = @accountID`);

        if (result.recordset.length === 0) return false;

        const balance = result.recordset[0].balance;
        return balance >= totalCost;
    }

    //Metode der checker om der er nok aktier i en portefølje (i holdings)
    //Holdings er en tabel der indeholder alle aktier i en portefølje
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

    //Metode der opdaterer holdings i databasen efter en handel
    //Den fjerner eller tilføjer en mængde baseret på trade typen
    //Quantit ændringen er positiv ved køb og negativ ved salg
    static async adjustHoldings(portfolioID, ticker, quantityChange, stockID) {
        const pool = await connectToDB();
   
        //Checker om holding eksisterer baseret på portfolioID og ticker
        const result = await pool.request()
            .input("portfolioID", sql.Int, portfolioID)
            .input("ticker", sql.NVarChar, ticker)
            .query(`
                SELECT quantity FROM Holdings
                WHERE portfolioID = @portfolioID AND ticker = @ticker
            `);

        //Hvis holding eksisterer, opdateres den   
        if (result.recordset.length > 0) {
            const currentQuantity = result.recordset[0].quantity;
            const newQuantity = currentQuantity + quantityChange; // tilføjer eller trække fra den nuværende mængde
            
            //Opdaterer quantity hvis den er positiv (større end 0)
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
            //Hvis mængden er negativ (0 eller mindre), slettes rækken fra holdings
            //Dvs, at brugeren ikke har flere aktier tilbage i sin holdings
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
            //Hvis quantity er positiv, indsættes en ny holding hvis der ikke allerede eksisterer en
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
