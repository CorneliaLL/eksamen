// Importerer nødvendige modeller og services
const { Trade } = require("../models/tradeModels");
const { Transaction } = require("../models/transactionModels");
const { Stocks } = require("../models/stockModels");
const { storeExchangeRate } = require("../services/fetchExchangeRate"); // Valutakurs-service
const { Account } = require("../models/accountModels"); // Konto-model

// Funktion: Behandler en aktiehandel (køb eller salg)
async function handleTrade(req, res) {
    try {
        // Henter brugerens ID fra sessionen
        const userID = req.session.userID;
        if (!userID) return res.status(401).send("Unauthorized"); // bruger ikke logget ind

        // Henter nødvendige værdier fra formularen
        let { portfolioID, accountID, Ticker, tradeType, quantity } = req.body;
        console.log(`Trade request received:`, { userID, portfolioID, accountID, Ticker, tradeType, quantity });

        // Validerer at alle felter er udfyldt
        if (!portfolioID || !accountID || !Ticker || !tradeType || !quantity) {
            console.log("Missing required trade fields");
            return res.render("trade", {
                stockData: null,
                error: "All fields are required",
                success: null
            });
        }

        // Konverterer mængde til tal
        const qty = parseFloat(quantity);
        console.log(`Parsed quantity: ${qty}`);

        // Henter aktiedata fra databasen (ikke API!)
        const dbStock = await Stocks.findStockByTicker(Ticker);
        console.log("line 35 runs")
        if (!dbStock) {
            console.log(`Stock ${Ticker} not found in database`);
            return res.render("trade", {
                stockData: null,
                error: "Stock not found. Please search for the stock first.",
                success: null
            });
        }

        // Uddrager nødvendige felter fra databasen
        Ticker = dbStock.Ticker;
        const stockID = dbStock.StockID;
        const stockName = dbStock.StockName || Ticker;
        const stockCurrency = dbStock.StockCurrency;
        const closePrice = parseFloat(dbStock.ClosePrice);
        console.log(`Using stock: ${stockName} (${stockCurrency}) @ ${closePrice}`);

        // Finder kontoen og validerer at den findes og er aktiv
        const account = await Account.findAccountByID(accountID);
        console.log("53")
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

        // Kontrollerer om kontoen er deaktiveret
        if (account.accountStatus === 0) {
            console.log(`Account ${accountID} is deactivated`);
            return res.render("trade", {
                stockData: null,
                error: "Trade not possible, account is deactivated",
                success: null
            });
        }

        // Justerer prisen hvis aktiens valuta ≠ kontoens valuta
        let adjustedPrice = closePrice;
        if (stockCurrency !== accountCurrency) {
            console.log("79")
            const rate = await storeExchangeRate(stockCurrency, accountCurrency); // henter valutakurs
            console.log("storeExchangeRate")
            adjustedPrice = closePrice * rate;
            console.log(`Currency converted: ${closePrice} ${stockCurrency} → ${adjustedPrice} ${accountCurrency}`);
        }

        // Beregner gebyr og totalpris (inkl. fee)
        const feeRate = 0.005; // 0.5% handelsgebyr
        const transactionFee = qty * adjustedPrice * feeRate;
        const totalPrice = qty * adjustedPrice + transactionFee;
        console.log(`Fee: ${transactionFee.toFixed(2)}, Total price: ${totalPrice.toFixed(2)}`);

        // Ved køb: kontrollerer om der er nok midler på kontoen
        if (tradeType === "buy") {
            console.log("94")
            const hasFunds = await Trade.checkFunds(accountID, totalPrice);
            console.log(`Has funds for buy? ${hasFunds}`);
            if (!hasFunds) {
              
                // This is where your currently endng up
                // This is where you need to igure out how to keep the account and portfolio ID in the URL somehow
                // OR justredirect to a simple page
                return res.render("trade", {
                    stockData: null,
                    error: "Insufficient funds",
                    success: null
                });
            }
        }

        // Ved salg: kontrollerer om brugeren ejer nok aktier
        if (tradeType === "sell") {
            console.log("108")
            const hasHoldings = await Trade.checkHoldings(portfolioID, Ticker, qty);
            console.log(`Has holdings to sell? ${hasHoldings}`);
            if (!hasHoldings) {
                return res.status(400).send("Insufficient holdings to sell.");
            }
        }

        // Opretter en ny handel i databasen
        const tradeID = await Trade.createTrade({
            portfolioID,
            accountID,
            stockID: parseInt(stockID),
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

        // Opretter en transaktion (beløbet er negativt ved køb, positivt ved salg)
        const transactionAmount = tradeType === "buy" ? -totalPrice : totalPrice;
        const transaction = new Transaction(null, accountID, tradeID, transactionAmount, new Date());
        await transaction.registerTransaction();
        console.log(`Transaction registered: ${transactionAmount}`);

        // Opdaterer brugerens beholdning i porteføljen
        const quantityChange = tradeType === "buy" ? qty : -qty;
        await Trade.adjustHoldings(portfolioID, Ticker, quantityChange, stockID);
        console.log(`Holdings adjusted by ${quantityChange} for ${Ticker}`);

        // Omdirigerer brugeren til deres portefølje-side
        console.log(`Trade completed successfully. Redirecting to portfolio ${portfolioID}`);
        return res.redirect(`/portfolio/${portfolioID}/${accountID}`);


    } catch (err) {
        // Håndterer fejl undervejs og viser fejlmeddelelse i view
       // console.error("Error handling trade:", err.stack);
        res.render("trade", {
            stockData: null,
            error: "Trade could not be processed. Please try again.",
            success: null,
            portfolioID: null,
            accountID: null
        });
        console.error("Trade failed:", err.stack || err);

    }
}

module.exports = { handleTrade };