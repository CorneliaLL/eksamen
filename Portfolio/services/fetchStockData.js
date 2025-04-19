//service folder: handles functionality - calls api (stock data) and saves data

const axios = require('axios'); //to get data from the internet -> npm install axios
const { sql } = require('../database'); //saves in the SQL database

async function storeStockData(ticker) {
    const apiKey = '5WEYK0DRXVCFWJPW' //personal alpha vantage api key
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${apiKey}`
    //base url - request daily stock prices - specific stock data - personal api key to get data

    try {
        const response = await axios.get(url); //gets data from api
        const data = response.data; //saves response answer 

        if (data['Time Series (Daily)']) { //reads newest share price 
            const latestDate = Object.keys(data['Time Series (Daily)'])[0]; //finds newest day 
            const latestInfo = data['Time Series (Daily)'][latestDate]; //finds date for specific day
            const closePrice = latestInfo['4. close']; //close prise for specific day 

            //saves in sql database
            //saves ticker, dato and price in database
            await sql.query`  
            INSERT INTO Stocks (Ticker, Date, Closeprice)
            VALUES (${ticker}, ${latestDate}, ${closePrice})
            `;

            console.log(`Saved ${ticker}: ${latestDate} - ${closePrice}`);
        } else {
            console.error(`No data was found for`, ticker);
        }
    } catch (error) { //catches error and sends error message 
        console.error(`Error while collecting data`, error)
    }
}

module.exports = { storeStockData };