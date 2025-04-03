class Stock{
    constructor(stockID, portfolioID, stockName, currency, currentPrice, stockType){
        this.stockID = stockID;
        this.portfolioID = portfolioID;
        this.stockName = stockName;
        this.currency = currency;
        this.currentPrice = currentPrice;
        this.stockType = stockType;
    }
}


//Class made to keep track of a stock's price history
class priceHistory{
    constructor(historyID, stockID, price, date){
        this.historyID = historyID;
        this.stockID = stockID;
        this.price = price;
        this.date = date;
    }
}