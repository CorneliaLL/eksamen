//Axois håndterer automatisk fejl 4xx/5xx og giver direkte data hvorimod fetch bruger json respons manulelt
const axios = require('axios');
const dotenv = require('dotenv'); 
dotenv.config();

async function fetchStockData(ticker) {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY_STOCKS; // Alpha Vantage API nøgle
  //API-endpoint til daglige priser
  const priceUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${apiKey}`;
  //API-endpoint til aktiens beskrivelse (navn, valuta, type)
  const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`;

  try {
    //Kalder API for prisdata
    const priceResponse = await axios.get(priceUrl); 
    const priceData = priceResponse.data;

    // Tjek for rate limit eller fejl
    //Blev brugt til at tjekke om vi havde brugt alle API for at identificere fejl
    if (priceData['Note'] || priceData['Information']) {
      return { error: "Rate limit fra Alpha Vantage. Prøv igen senere." };
    }

    //Kalder daglige priser (timeseries)
    const timeSeries = priceData['Time Series (Daily)'];
    if (!timeSeries) {
      return null;
    }

    //Finder seneste dato og tilhørende lukkepris
    const dates = Object.keys(timeSeries);
    const latestDate = dates[0];
    const closePrice = parseFloat(timeSeries[latestDate]['4. close']);

    //Kalder aktiens data
    const overviewResponse = await axios.get(overviewUrl);
    const overviewData = overviewResponse.data;

    const stockName = overviewData.Name || ticker;
    const stockCurrency = overviewData.Currency || 'Unknown';
    const stockType = overviewData.AssetType || 'Unknown';

    return {
      ticker,
      latestDate,
      closePrice,
      timeSeries, // hele tidsserien til brug i controlleren
      stockName,
      stockCurrency,
      stockType,
    };

  } catch (error) {
    console.error("Error while collecting data:", error);
    return null;
  }
}

module.exports = { fetchStockData };
