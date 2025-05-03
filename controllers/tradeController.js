const { Trade } = require("../models/tradeModels");
const { Transaction } = require("../models/transactionModels");
const { fetchStockData } = require("../services/fetchStockData"); // Fetches stock data live from AlphaVantage
const { storeExchangeRate } = require("../services/fetchExchangeRate"); // Fetches currency conversion rate live
const { Account } = require("../models/accountModels"); // Account model to check user balance

// Handles a buy or sell trade
async function handleTrade(req, res) {
    try {
        const userID = req.session.userID;
        if (!userID) return res.status(401).send("Unauthorized");

        const { portfolioID, accountID, Ticker, tradeType, quantity, fee } = req.body;

          // Validate required fields
          if (!portfolioID || !accountID || !Ticker || !tradeType || !quantity) {
            return res.render("trade", {
                stockData: null,
                error: "All fields are required",
                success: null
            }); //vise fejlmeddelelser i view'et i stedet for at sende HTTP statuskoder
        }

        // convert quantity and fee to float for calculations
        const qty = parseFloat(quantity);
        const transactionFee = parseFloat(fee) || 0;

        // Fetch live stock data using external API
        const stockData = await fetchStockData(Ticker);
        if (!stockData) {
            return res.render("trade", {
                stockData: null,
                error: "Invalid ticker symbol or failed to fetch stock data",
                success: null
            });
        }

        const stockName = stockData.stockName || Ticker; // fallback if no name
        const stockCurrency = stockData.currency;
        const closePrice = parseFloat(stockData.closePrice);

        // Find the accounts currency
        const account = await Account.findAccountByID(accountID);
        if (!account) {
            return res.render("trade", {
                stockData: null,
                error: "Account not found",
                success: null
            });
        }
        const accountCurrency = account.currency;
        
        // Validates the account status
        if (account.accountStatus === 0) {
            return res.render("trade", {
                stockData: null,
                error: "Trade not possible, account is deactivated",
                success: null
            });
        }

        // Adjust the price if stock and account are in different currencies
        let adjustedPrice = closePrice;
        if (stockCurrency !== accountCurrency) {
            const rate = await storeExchangeRate(stockCurrency, accountCurrency);
            adjustedPrice = closePrice * rate;
            console.log(`Exchange rate applied: 1 ${stockCurrency} = ${rate} ${accountCurrency}`);
        }

        // Calculate total price of the trade including transaction fee
        const totalPrice = qty * adjustedPrice + transactionFee;

        //Validate sufficient holdings for BUY
        if (tradeType === "buy") {
            const hasFunds = await Trade.checkFunds(accountID, totalPrice);
            if (!hasFunds) {
                return res.render("trade", {
                    stockData: null,
                    error: "Insufficient holdings to sell",
                    success: null
                });
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
        res.render("trade", {
            stockData: null,
            error: "Trade could not be processed. Please try again.",
            success: null
        });
    }
}


module.exports = { handleTrade };
