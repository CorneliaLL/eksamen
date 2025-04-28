//service folder: handles functionality - calls api (stock data) and saves data
//gets stockdata from AV api so it can be saved locally 

const axios = require('axios'); //to get data from the internet -> npm install axios

async function storeStockData(ticker) {
    const apiKey = '5WEYK0DRXVCFWJPW' //personal alpha vantage api key
    const priceUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${apiKey}`;
    const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`;
    //base url - request daily stock prices - specific stock data - personal api key to get data

    try {
        const priceResponse = await axios.get(priceUrl); //gets data from api
        const priceData = priceResponse.data; //saves response answer

        if (priceData['Time Series (Daily)']) { //reads newest share price 
            const latestDate = Object.keys(priceData['Time Series (Daily)'])[0]; //finds newest day 
            const latestInfo = priceData['Time Series (Daily)'][latestDate]; //finds date for specific day
            const closePrice = latestInfo['4. close']; //close prise for specific day 

        const overviewResponse = await axios.get(overviewUrl);
        const overviewData = overviewResponse.data;

        const stockName = overviewData.Name || ticker;
        const currency = overviewData.Currency || 'Unknown';
        const stockType = overviewData.AssetType || 'Unknown';

        console.log(`Saved stock ${ticker} (${stockName}) successfully!`);

            return { 
                ticker, 
                date: latestDate, 
                closePrice, 
                stockName: overviewData.Name || ticker,
                currency: overviewData.Currency || 'DKK', 
                stockType: overviewData.AssetType || 'stock' 
            };

        } else {
            console.error(`No data was found for`, ticker);
        }
    } catch (error) { //catches error and sends error message 
        console.error(`Error while collecting data`, error)
    }
}

module.exports = { storeStockData };

//kilder: 
//https://www.alphavantage.co/documentation/ - Time Series Dailey
//https://medium.com/@uttamcseau/building-an-api-to-retrieve-stock-data-using-alpha-vantage-and-node-js-99f2d28021cd - API KEY