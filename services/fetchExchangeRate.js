//service folder: handles functionality - calls api (stock data) and saves data

const fetch = require('node-fetch'); // Hvis vi bruger axios får vi automatisk fejl 4xx/5xx på. Axios giver også direkte data hvorimod fetch bruger json respons manulelt
const { sql } = require('../database'); //saves in the SQL database

async function storeExchangeRate(fromCurrency, toCurrency) {
    const apiKey = '6ac9beff21a769655130893e'; // din rigtige nøgle
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error! Status: ${response.status}`);
        }

        const data = await response.json();
        const rate = data.conversion_rates[toCurrency];

        const ticker = `${fromCurrency}${toCurrency}`;
        const today = new Date().toISOString().split('T')[0]; 


        if (!rate) throw new Error(`Rate not found for ${fromCurrency} to ${toCurrency}`);
            
            await sql.query`  
            INSERT INTO ExchangeRates (Ticker, FromCurrency, ToCurrency, Rate)
            VALUES (${ticker}, ${fromCurrency}, ${toCurrency}, ${today}, ${rate})
            `;

        return rate;
    } catch (error) {
        console.error(`Error fetching exchange rate from ${fromCurrency} to ${toCurrency}:`, error);
        throw error;
    }
}


module.exports = { storeExchangeRate };