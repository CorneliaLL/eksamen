const axios = require('axios');

async function fetchStockData(ticker) {
  const apiKey = 'GYAAYWWHIFGTY73B'; // Alpha Vantage API key
  const priceUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${apiKey}`;
  const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`;

  try {
    const priceResponse = await axios.get(priceUrl);
    const priceData = priceResponse.data;

    // Tjek for rate limit eller fejl
    if (priceData['Note'] || priceData['Information']) {
      console.error("Rate limit reached or invalid request:", priceData);
      return { error: "Rate limit fra Alpha Vantage. Prøv igen senere." };
    }

    const timeSeries = priceData['Time Series (Daily)'];
    if (!timeSeries) {
      console.error(`No time series data found for ${ticker}`);
      return null;
    }

    const dates = Object.keys(timeSeries);
    const latestDate = dates[0];
    const closePrice = parseFloat(timeSeries[latestDate]['4. close']);

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
