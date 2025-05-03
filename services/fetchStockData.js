//service folder: handles functionality - calls api (stock data) and saves data
//gets stockdata from AV api so it can be saved locally 

const axios = require('axios'); //to get data from the internet -> npm install axios

async function fetchStockData(ticker) {
    const apiKey = '5WEYK0DRXVCFWJPW' //personal alpha vantage api key
    const priceUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${apiKey}`;
    const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`;
    //base url - request daily stock prices - specific stock data - personal api key to get data

    try {
        const priceResponse = await axios.get(priceUrl); //gets data from api
        const priceData = priceResponse.data; //saves response answer

        if (priceData['Time Series (Daily)']) { //reads newest share price 

            const timeSeries = priceData['Time Series (Daily)']
            const dates = Object.keys(timeSeries);

            const latestDate = dates[0]; //finds newest day 
            const previousDate = dates[1];

            const closePrice = parseFloat(timeSeries[latestDate]['4. close']); //close prise for specific day 
            const previousClosePrice = parseFloat(timeSeries[previousDate]['4. close']);

            const dailyChange = ((closePrice - previousClosePrice) / previousClosePrice) * 100;

            // tester lige om data kommer ud
            console.log(`Ticker: ${ticker}`);
            console.log(`Date: ${latestDate}`);
            console.log(`Close Price: ${closePrice}`);
            console.log(`Previous Date: ${previousDate}`);
            console.log(`Previous Close: ${previousClosePrice}`);
            console.log(`Daily Change: ${dailyChange}`);

        const overviewResponse = await axios.get(overviewUrl);
        const overviewData = overviewResponse.data;

        const stockName = overviewData.Name || ticker;
        const stockCurrency = overviewData.Currency || 'Unknown';
        const stockType = overviewData.AssetType || 'Unknown';

        console.log(`Saved stock ${ticker} (${stockName}) successfully!`);

            return { 
                ticker, 
                latestDate, 
                closePrice, 
                stockName,
                stockCurrency, 
                stockType,
                dailyChange: dailyChange.toFixed(2)
            };

        } else {
            console.error(`No data was found for`, ticker);
        }
    } catch (error) { //catches error and sends error message 
        console.error(`Error while collecting data`, error)

    }
}

module.exports = { fetchStockData };


//kilder: 
//https://www.alphavantage.co/documentation/ - Time Series Dailey
//https://medium.com/@uttamcseau/building-an-api-to-retrieve-stock-data-using-alpha-vantage-and-node-js-99f2d28021cd - API KEY