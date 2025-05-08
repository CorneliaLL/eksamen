const { sql } = require('../database');

async function getExchangeRate(fromCurrency, toCurrency) {
    const result = await sql.query`
        SELECT TOP 1 rate, date
        FROM ExchangeRates
        WHERE fromCurrency = ${fromCurrency} AND toCurrency = ${toCurrency}
        ORDER BY date DESC
    `;
    return result.recordset[0];
}

module.exports = {
    getExchangeRate,
};