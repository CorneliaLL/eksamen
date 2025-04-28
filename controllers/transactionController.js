const { Transaction } = require("../models/transactionModels");

// show transactions for a specific account
// this function is called when the user clicks on an account in the overview 
async function showTransactions(req, res) {
  try {
    const { accountID } = req.params;

    const transactions = await Transaction.getTransactions(accountID);

    res.render("transactions", { transactions });

  } catch (err) {
    console.error("Error showing transactions:", err.message);
    res.status(500).send("Could not load transactions");
  }
}

module.exports = { showTransactions };
