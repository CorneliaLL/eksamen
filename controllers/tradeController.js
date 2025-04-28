const { Trade } = require("../models/tradeModels");
const { Transaction } = require("../models/transactionModels");


async function handleTrade(req, res) {
    try {
        const userID = req.session.userID;
        if (!userID) return res.status(401).send("Unauthorized");
        
        const { portfolioID, accountID, stockID, tradeType, quantity, price, fee} = req.body;

        //convert the quantity, price and fee from string to float/number
        // Convert quantity, price, and fee from string to number.
        // All form or JSON input values from req.body are strings by default, 
        // so we use parseFloat to ensure numeric calculations (like totalPrice) work correctly
        const qty = parseFloat(quantity);
        const prc = parseFloat(price);
        const transactionFee = parseFloat(fee);

        const stock = await Stocks.findStockByID(stockID); 
        const stockCurrency = stock.currency;

        const account = await Account.findAccountByID(accountID);
        const accountCurrency = account.currency;

        let adjustedPrice = prc;

        if (stockCurrency !== accountCurrency) {
            const rate = await storeExchangeRate(stockCurrency, accountCurrency);
            adjustedPrice = prc * rate;
            console.log(`Exchange rate applied: 1 ${stockCurrency} = ${rate} ${accountCurrency}`);
        }

        //calculate the total cost of the trade
        // This will later be used to validate funds and update the account balance.
        const totalPrice = qty * adjustedPrice + transactionFee;

        // check if the user has enough funds in the account;
        if (tradeType === "buy") {
            const hasFunds = await Trade.checkFunds(accountID, totalPrice);
            if (!hasFunds) {
                return res.status(400).send("Insufficient funds");
            }
        }

        //check if the user has enough holdings in the account 
        if (tradeType === "sell") {
            const hasHolding = await Trade.checkHoldings(portfolioID, stockID, quantity);
            if (!hasHolding) {
                return res.status(400).send("insufficient holdings");
            }
        }

        //create the trade
        const tradeID = await Trade.createTrade({portfolioID, accountID, stockID, tradeType, quantity: qty, price: adjustedPrice, fee: transactionFee, totalPrice, tradeDate: new Date()});
        
        //Register the transaction
        const transactionAmount = tradeType === "buy" ? -totalPrice : totalPrice; //if its a buy, substract the total cost from the account, if sell add the total cost to the account
        const transaction = new Transaction(null, accountID, tradeID, transactionAmount, new Date());
        await transaction.registerTransaction();

        
       if (tradeType === "buy") {
        await Trade.updateHoldingsAfterBuy(portfolioID, stockID, qty);
       }
       if (tradeType === "sell") {
        await Trade.updateHoldingsAfterSell(portfolioID, stockID, qty);
       }

        res.redirect(`/portfolio/${portfolioID}`); //redirect to the portfolio after trade

    }catch (err) {
        console.error("Error handling trade:", err);
        res.status(500).send("Trade could not be processed");
    }
}

module.exports = {handleTrade};