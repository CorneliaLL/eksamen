const { Trade } = require("../models/tradeModels");
const { Transaction } = require("../models/transactionModels");
const { Stocks } = require("../models/stockModels");
const { storeExchangeRate } = require("../services/fetchExchangeRate");
const { Account } = require("../models/accountModels");

// Behandler en aktiehandel (køb eller salg)
async function handleTrade(req, res) {
    try {
        const userID = req.session.userID;
        if (!userID) return res.status(401).send("Unauthorized"); 
        // Henter nødvendige værdier fra formularen
        let { portfolioID, accountID, ticker, tradeType, quantity } = req.body;

        // Validerer at alle felter er udfyldt
        if (!portfolioID || !accountID || !ticker || !tradeType || !quantity) {

        
            return res.render("trade", {
                stockData: null,
                error: "All fields are required",
                success: null,
                portfolioID,
                accountID
            });
        }

        // Konverterer mængde til tal
        const qty = parseFloat(quantity);

        // Henter aktiedata fra databasen 
        const dbStock = await Stocks.findStockByTicker(ticker);
        if (!dbStock) {
            return res.render("trade", {
                stockData: null,
                error: "Stock not found. Please search for the stock first.",
                success: null
            });
        }

        // Uddrager nødvendige felter fra databasen
        ticker = dbStock.ticker;
        const stockID = dbStock.stockID;
        const stockName = dbStock.StockName || ticker;
        const stockCurrency = dbStock.stockCurrency;
        const closePrice = parseFloat(dbStock.closePrice);

        // Finder kontoen og validerer at den findes og er aktiv
        const account = await Account.findAccountByID(accountID);
        if (!account) {
            return res.render("trade", {
                stockData: null,
                error: "Account not found",
                success: null
            });
        }

        const accountCurrency = account.currency;

        // Kontrollerer om kontoen er deaktiveret
        if (account.accountStatus === 0) {
            return res.render("trade", {
                stockData: null,
                error: "Trade not possible, account is deactivated",
                success: null
            });
        }

        // Justerer prisen hvis aktiens valuta ≠ kontoens valuta
        let adjustedPrice = closePrice;
        if (stockCurrency !== accountCurrency) {
            const rate = await storeExchangeRate(stockCurrency, accountCurrency); // henter valutakurs 
            adjustedPrice = closePrice * rate;
        }

        // Beregner gebyr og totalpris (inkl. fee)
        const feeRate = 0.005; // 0.5% handelsgebyr
        const transactionFee = qty * adjustedPrice * feeRate;
        const totalPrice = qty * adjustedPrice + transactionFee;

        // Ved køb: kontrollerer om der er nok midler på kontoen
        if (tradeType === "buy") {
            const hasFunds = await Trade.checkFunds(accountID, totalPrice);
            if (!hasFunds) {
              
             return res.render("trade", {
                    stockData: null,
                    error: "Insufficient funds",
                    success: null
                });
            }
        }

        // Ved salg: kontrollerer om brugeren ejer nok aktier
        if (tradeType === "sell") {
            const hasHoldings = await Trade.checkHoldings(portfolioID, ticker, qty);
            if (!hasHoldings) {
                return res.status(400).send("Insufficient holdings to sell.");
            }
        }

        // Opretter en ny handel i databasen
        const tradeID = await Trade.createTrade({
            portfolioID,
            accountID,
            stockID: parseInt(stockID),
            ticker,
            stockName,
            tradeType,
            quantity: qty,
            price: adjustedPrice,
            fee: transactionFee,
            totalPrice,
            tradeDate: new Date()
        });

        // Opretter en transaktion (beløbet er negativt ved køb, positivt ved salg)
        //registrer køb af aktier i en portefølje 
        const transactionAmount = tradeType === "buy" ? -totalPrice : totalPrice;
        await Transaction.registerTransaction({
            accountID,
            tradeID,
            amount: transactionAmount,
            transactionDate: new Date()
          });

        // Opdaterer brugerens beholdning i porteføljen
        const quantityChange = tradeType === "buy" ? qty : -qty;
        await Trade.adjustHoldings(portfolioID, ticker, quantityChange, stockID);

        // Omdirigerer brugeren til deres portefølje-side
        return res.redirect(`/portfolio/${portfolioID}/${accountID}`);


    } catch (err) {
            res.render("trade", {
            stockData: null,
            error: "Trade could not be processed. Please try again.",
            success: null,
            portfolioID: null,
            accountID: null
        });
    }
}

module.exports = { handleTrade };