const { sql } = require('../database');

async function getExchangeRate(fromCurrency, toCurrency) {
    const result = await sql.query`
        SELECT TOP 1 Rate, Date
        FROM ExchangeRates
        WHERE FromCurrency = ${fromCurrency} AND ToCurrency = ${toCurrency}
        ORDER BY Date DESC
    `;
    return result.recordset[0];
}

module.exports = {
    getExchangeRate,
};