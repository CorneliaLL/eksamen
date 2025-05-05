const { Trade } = require("../models/tradeModels");
const { Transaction } = require("../models/transactionModels");
const { Stocks } = require("../models/stockModels")
const { storeExchangeRate } = require("../services/fetchExchangeRate"); // Fetches currency conversion rate live
const { Account } = require("../models/accountModels"); // Account model to check user balance

// Handles a buy or sell trade

async function handleTrade(req, res) {
    try {
        const userID = req.session.userID;
        if (!userID) return res.status(401).send("Unauthorized");

        const { portfolioID, accountID, Ticker, tradeType, quantity } = req.body;
        console.log(`Trade request received:`, { userID, portfolioID, accountID, Ticker, tradeType, quantity });

        if (!portfolioID || !accountID || !Ticker || !tradeType || !quantity) {
            console.log("Missing required trade fields");
            return res.render("trade", {
                stockData: null,
                error: "All fields are required",
                success: null
            });
        }

        const qty = parseFloat(quantity);
        console.log(`Parsed quantity: ${qty}`);

        const dbStock = await Stocks.findStockByTicker(Ticker);
        if (!dbStock) {
            console.log(`Stock ${Ticker} not found in database`);
            return res.render("trade", {
                stockData: null,
                error: "Stock not found. Please search for the stock first.",
                success: null
            });
        }

        const stockName = dbStock.StockName || Ticker;
        const stockCurrency = dbStock.StockCurrency;
        const closePrice = parseFloat(dbStock.ClosePrice);
        console.log(`Using stock: ${stockName} (${stockCurrency}) @ ${closePrice}`);

        const account = await Account.findAccountByID(accountID);
        if (!account) {
            console.log(`Account ${accountID} not found`);
            return res.render("trade", {
                stockData: null,
                error: "Account not found",
                success: null
            });
        }

        const accountCurrency = account.currency;
        console.log(`Account currency: ${accountCurrency}`);

        if (account.accountStatus === 0) {
            console.log(`Account ${accountID} is deactivated`);
            return res.render("trade", {
                stockData: null,
                error: "Trade not possible, account is deactivated",
                success: null
            });
        }

        let adjustedPrice = closePrice;
        if (stockCurrency !== accountCurrency) {
            const rate = await storeExchangeRate(stockCurrency, accountCurrency);
            adjustedPrice = closePrice * rate;
            console.log(`Currency converted: ${closePrice} ${stockCurrency} → ${adjustedPrice} ${accountCurrency}`);
        }

        const feeRate = 0.005;
        const transactionFee = qty * adjustedPrice * feeRate;
        const totalPrice = qty * adjustedPrice + transactionFee;
        console.log(`Fee: ${transactionFee.toFixed(2)}, Total price: ${totalPrice.toFixed(2)}`);

        if (tradeType === "buy") {
            const hasFunds = await Trade.checkFunds(accountID, totalPrice);
            console.log(`Has funds for buy? ${hasFunds}`);
            if (!hasFunds) {
                return res.render("trade", {
                    stockData: null,
                    error: "Insufficient funds",
                    success: null
                });
            }
        }

        if (tradeType === "sell") {
            const hasHoldings = await Trade.checkHoldings(portfolioID, Ticker, qty);
            console.log(`Has holdings to sell? ${hasHoldings}`);
            if (!hasHoldings) {
                return res.status(400).send("Insufficient holdings to sell.");
            }
        }

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
        console.log(`Trade created with ID: ${tradeID}`);

        const transactionAmount = tradeType === "buy" ? -totalPrice : totalPrice;
        const transaction = new Transaction(null, accountID, tradeID, transactionAmount, new Date());
        await transaction.registerTransaction();
        console.log(`Transaction registered: ${transactionAmount}`);

        const quantityChange = tradeType === "buy" ? qty : -qty;
        await Trade.adjustHoldings(portfolioID, Ticker, quantityChange);
        console.log(`Holdings adjusted by ${quantityChange} for ${Ticker}`);

        console.log(`Trade completed successfully. Redirecting to portfolio ${portfolioID}`);
        res.redirect(`/portfolio/${portfolioID}`);

    } catch (err) {
        console.error("Error handling trade:", err);
        res.render("trade", {
            stockData: null,
            error: "Trade could not be processed. Please try again.",
            success: null,
            portfolioID: null,
            accountID: null
        });
    }
}


















/*
    try {
        const userID = req.session.userID;
        if (!userID) return res.status(401).send("Unauthorized");

        const { portfolioID, accountID, Ticker, tradeType, quantity } = req.body;

          // Validate required fields - bruges? test 
          if (!portfolioID || !accountID || !Ticker || !tradeType || !quantity) {
            return res.render("trade", {
                stockData: null,
                error: "All fields are required",
                success: null
            }); //vise fejlmeddelelser i view'et i stedet for at sende HTTP statuskoder
        }

        // convert quantity and fee to float for calculations
        const qty = parseFloat(quantity);


        // Fetch live stock data using external API
        const stockData = await fetchStockData(Ticker);
        if (!stockData) {
            return res.render("trade", {
                stockData: null,
                error: "Invalid ticker symbol or failed to fetch stock data",
                success: null
            });
        }

        const stockName = stockName || Ticker; // fallback if no name
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
        const feeRate = 0.005;
        const transactionFee = qty * adjustedPrice * feeRate;
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
        const quantityChange = tradeType === "buy" ? qty : -qty;
        await Trade.adjustHoldings(portfolioID, Ticker, quantityChange);

        //skal testes - bør gemme stock data i databasen når en stock købes af en user 

        if (tradeType === "buy") { - blev brugt før til at opdatere holding men ser ikke ud til at virke 
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
*/

module.exports = { handleTrade };