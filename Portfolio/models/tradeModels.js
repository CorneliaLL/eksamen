class Trade{
    constructor(tradeID, portfolioID, accountID, stockID, tradeType, quantity, price){
        this.tradeID = tradeID;
        this.portfolioID = portfolioID;
        this.accountID = accountID;
        this.stockID = stockID;
        this.tradeType = tradeType;
        this.quantity = quantity;
    }
}

module.exports = { Trade };