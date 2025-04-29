const { Trade } = require("../models/tradeModels");
const { Transaction } = require("../models/transactionModels");
const { storeStockData } = require("../services/fetchStockData"); // Fetches stock data live from AlphaVantage
const { storeExchangeRate } = require("../services/fetchExchangeRate"); // Fetches currency conversion rate live
const { Account } = require("../models/accountModels"); // Account model to check user balance

// Handles a buy or sell trade
async function handleTrade(req, res) {
    try {
        const userID = req.session.userID;
        if (!userID) return res.status(401).send("Unauthorized");

        const { portfolioID, accountID, Ticker, tradeType, quantity, fee } = req.body;

        // convert quantity and fee to float for calculations
        const qty = parseFloat(quantity);
        const transactionFee = parseFloat(fee);

        // Fetch live stock data using external API
        const stockData = await storeStockData(Ticker);
        if (!stockData) {
            return res.status(400).send("Invalid ticker symbol or failed to fetch stock data.");
        }

        const stockName = stockData.stockName || Ticker; // fallback if no name
        const stockCurrency = stockData.currency;
        const closePrice = parseFloat(stockData.closePrice);

        // Find the accounts currency
        const account = await Account.findAccountByID(accountID);
        const accountCurrency = account.currency;

        if (account.accountStatus === 0) {
            return res.status(401).send("Trade not possible, account is deactivated");
        }

        // Adjust the price if stock and account are in different currencies
        let adjustedPrice = closePrice;
        if (stockCurrency !== accountCurrency) {
            const rate = await storeExchangeRate(stockCurrency, accountCurrency); // fetch exchange rate live
            adjustedPrice = closePrice * rate;
            console.log(`Exchange rate applied: 1 ${stockCurrency} = ${rate} ${accountCurrency}`);
        }

        // Calculate total price of the trade including transaction fee
        const totalPrice = qty * adjustedPrice + transactionFee;

        //Validate sufficient holdings for BUY
        if (tradeType === "buy") {
            const hasFunds = await Trade.checkFunds(accountID, totalPrice);
            if (!hasFunds) {
                return res.status(400).send("Insufficient funds in account.");
            }
        }

        // Validate sufficient holdings for SELL
        if (tradeType === "sell") {
            const hasHoldings = await Trade.checkHoldings(portfolioID, Ticker, qty);
            if (!hasHoldings) {
                return res.status(400).send("Insufficient holdings to sell.");
            }
        }

        // Create a new Trade in the database
        const tradeID = await Trade.createTrade({
            portfolioID,
            accountID,
            Ticker,
            stockName,
            tradeType,
            quantity: qty,
            price: adjustedPrice,
            fee: transactionFee,
            totalPrice,
            tradeDate: new Date()
        });

        // create a new transaction in the database
        // the transaction amount is negative for buy trades and psoitive for sell trades
        const transactionAmount = tradeType === "buy" ? -totalPrice : totalPrice;
        const transaction = new Transaction(null, accountID, tradeID, transactionAmount, new Date());
        await transaction.registerTransaction();

        // Update users holdings based on the trade
        if (tradeType === "buy") {
            await Trade.updateHoldingsAfterBuy(portfolioID, Ticker, qty);
        } else if (tradeType === "sell") {
            await Trade.updateHoldingsAfterSell(portfolioID, Ticker, qty);
        }

        // Redirect the user back to their portfolio overview
        res.redirect(`/portfolio/${portfolioID}`);

    } catch (err) {
        console.error("Error handling trade:", err);
        res.status(500).send("Trade could not be processed.");
    }
}


module.exports = { handleTrade };
