//service folder: handles functionality - calls api (stock data) and saves data

const axios = require('axios'); // Hvis vi bruger axios får vi automatisk fejl 4xx/5xx på. Axios giver også direkte data hvorimod fetch bruger json respons manulelt
const { sql, connectToDB  } = require('../database'); //saves in the SQL database

async function storeExchangeRate(fromCurrency, toCurrency) {
    const apiKey = '6ac9beff21a769655130893e'; // din rigtige nøgle
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        console.log({data})
        
        const rate = data.conversion_rates[toCurrency];
        const ticker = `${fromCurrency}${toCurrency}`;
        console.log({ticker})

        const today = new Date().toISOString().split('T')[0]; 

        if (!rate) throw new Error(`Rate not found for ${fromCurrency} to ${toCurrency}`);

        const pool = await connectToDB(); 
    
        await pool.request()
        .input('Ticker', sql.NVarChar, ticker)
        .input('FromCurrency', sql.NVarChar, fromCurrency)
        .input('ToCurrency', sql.NVarChar, toCurrency)
        .input('Rate', sql.Decimal(18, 6), rate)
        .query(`
            INSERT INTO ExchangeRates (Ticker, FromCurrency, ToCurrency, Rate)
            VALUES (@Ticker, @FromCurrency, @ToCurrency, @Rate)
        `);
        
        return rate;
    } catch (error) {
        console.error(`Error fetching exchange rate from ${fromCurrency} to ${toCurrency}:`, error);
        throw error;
    }
}


module.exports = { storeExchangeRate };