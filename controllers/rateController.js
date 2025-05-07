const { storeExchangeRate } = require('../services/fetchExchangeRate');
const { getExchangeRate } = require('../models/exchangeRateModel');

// controller til at håndtere opdatering og visning af valutakurser
const updateExchangeRate = async (req, res) => {
    const { from, to } = req.params;

    try {
        const rate = await storeExchangeRate(from, to);
        res.send(`Updated exchange rate: ${from}/${to} = ${rate}`); // Beregner valutakursen ved at tage fra og til valuta 
    } catch (err) {
        res.status(500).send("Could not update exchange rate.");
    }
};

// Visning af valutakurser
const showExchangeRate = async (req, res) => {
    const { from, to } = req.params;

    try {
        const rateInfo = await getExchangeRate(from, to); // Henter valutakursen fra databasen ved at bruge fra og til valuta 
        if (!rateInfo) return res.status(404).send("Rate not found");

        // sender valutakursen og datoen for den seneste opdatering 
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