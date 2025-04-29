const { Transaction } = require("../models/transactionModels");

// show transactions for a specific account
// this function is called when the user clicks on an account in the overview 
async function showTransactions(req, res) {
  try {
    const { accountID } = req.params;

    const transactions = await Transaction.getTransactions(accountID);

    // Render the 'transactions' view and pass all fetched transactions
    res.render("transactions", { transactions });

  } catch (err) {
    console.error("Error showing transactions:", err.message);
    res.status(500).send("Could not load transactions");
  }
}

//Evt få det sendt til account ejs fil frem for portfolio
//Få det indsat direkte i account ejs filen frem for at have seperate ejs fil
//På den måde cutter vi ned på antallet af ejs filer og gør det mere overskueligt

module.exports = { showTransactions };
