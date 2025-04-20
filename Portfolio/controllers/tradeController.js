const { createTrade, checkFunds, checkHoldings } = require("../models/tradeModel");
const { registerTransaction } = require("../models/transactionModel");

async function handleTrade(req, res) {
    try {
        const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");
    
    const { portfolioID, accountID, stockID, tradeType, quantity, price, fee} = req.body;

    //convert the quantity, price and fee from string to float/number
    const qty = parseFloat(quantity);
    const prc = parseFloat(price);
    const transactionFee = parseFloat(fee);
    const totalCost = qty * prc + transactionFee; //calculate the total cost of the trade

    // check if the user has enough funds in the account;
    if (tradeType === "buy") {
        const hasFunds = await cheackFunds(accountID, totalCost);
        if (!hasFunds) {
            return res.status(400).send("Insufficient funds");
        }
    }

    //check if the user has enough holdings in the account 
    if (tradeType === "sell") {
        const hasHolding = await checkHoldings(portfolioID, stockID, quantity);
        if (!hasHolding) {
            return res.status(400).send("insufficient holdings");
        }
    }

    //create the trade
    const tradeID = await createTrade({portfolioID, accountID, stockID, tradeType, quantity: qty, price: prc, transactionFee, date: new Date()});
    
    //Register the transaction
    const transactionAmount = tradeType === "buy" ? -totalCost : totalCost; //if its a buy, substract the total cost from the account, if sell add the total cost to the account
    await registerTransaction({ accountID, tradeID, amount: transactionAmount, date: new Date()});

    res.redirect(`/portfolio/${portfolioID}`) //redirect to the portfolio after trade

}catch (err) {
    console.error("Error handling trade:", err.message);
    res.status(500).send("Trade could not be processed");
  }
}

module.exports = {handleTrade};