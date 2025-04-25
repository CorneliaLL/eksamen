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
        //calculate the total cost of the trade
        // This will later be used to validate funds and update the account balance.
        const totalPrice = qty * prc + transactionFee; 
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
        const tradeID = await Trade.createTrade({portfolioID, accountID, stockID, tradeType, quantity: qty, price: prc, fee: transactionFee, totalPrice, date: new Date()});
        
        //Register the transaction
        const transactionAmount = tradeType === "buy" ? -totalPrice : totalPrice; //if its a buy, substract the total cost from the account, if sell add the total cost to the account
        const transaction = new Transaction(null, accountID, tradeID, transactionAmount, new Date());
        await transaction.registerTransaction();

        res.redirect(`/portfolio/${portfolioID}`); //redirect to the portfolio after trade

    }catch (err) {
        console.error("Error handling trade:", err.message);
        res.status(500).send("Trade could not be processed");
    }
}

module.exports = {handleTrade};