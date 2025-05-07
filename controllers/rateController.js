const { storeExchangeRate } = require('../services/fetchExchangeRate');
const { getExchangeRate } = require('../models/exchangeRateModel');

// Controller til
const updateExchangeRate = async (req, res) => {
    const { from, to } = req.params;

    try {
        const rate = await storeExchangeRate(from, to);
        res.send(`Updated exchange rate: ${from}/${to} = ${rate}`);
    } catch (err) {
        res.status(500).send("Could not update exchange rate.");
    }
};

const showExchangeRate = async (req, res) => {
    const { from, to } = req.params;

    try {
        const rateInfo = await getExchangeRate(from, to);
        if (!rateInfo) return res.status(404).send("Rate not found");

        res.send({
            from,
            to,
            rate: rateInfo.Rate,
            date: rateInfo.Date
        });
    } catch (err) {
        res.status(500).send("Could not fetch exchange rate.");
    }
};

module.exports = {
    updateExchangeRate,
    showExchangeRate
}