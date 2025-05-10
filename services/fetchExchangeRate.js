//Service folder: Denne fil henter valutakurder fra ekstern API
//Axois håndterer automatisk fejl 4xx/5xx og giver direkte data hvorimod fetch bruger json respons manulelt
const axios = require('axios'); 

//Henter og gemmer valutakurs 
async function storeExchangeRate(fromCurrency, toCurrency) {
    //API-nøgle til exhangerate-API
    const apiKey = '6ac9beff21a769655130893e';
    //URL til at hente valutakurser fra en specifik basevaluta
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`;

    try {
        // Sender GET-req til API
        const response = await axios.get(url);
        //Gemmer dataobjektet fra svaret
        const data = response.data;
        
        //Henter kursen fra valuta
        const rate = data.conversion_rates[toCurrency];

        if (!rate) throw new Error(`Rate not found for ${fromCurrency} to ${toCurrency}`);
        return rate;
    } catch (error) {
        console.error(`Error fetching exchange rate from ${fromCurrency} to ${toCurrency}:`, error);
        throw error;
    }
}


module.exports = { storeExchangeRate };