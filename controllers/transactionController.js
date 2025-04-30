const { Transaction } = require("../models/transactionModels");
const { Account } = require("../models/accountModels");

// show transactions for a specific account
// this function is called when the user clicks on an account in the overview 
async function showTransactions(req, res) {
  try {
    const { accountID } = req.params;

    const transactions = await Transaction.getTransactions(accountID);
    const account = await Account.findAccountByID(accountID);

    // Render the 'transactions' view and pass all fetched transactions
    res.render("transactions", { transactions, account });

  } catch (err) {
    console.error("Error showing transactions:", err.message);
    res.status(500).send("Could not load transactions");
  }
}

async function handleAccountTransaction(req, res) {
  try{
    const { accountID } = req.params;
    //ADD INPUTS IN EJS THAT CORRELATES
    const { amount, type } = req.body;

    const account = await Account.findAccountByID(accountID);
    if (account.accountStatus === false) {
      return res.status(403).send("Cannot update balance for a deactivated account");
    }
    const chosenAmount = parseFloat(amount);

    //Checks and validates that the amount is a number and is greater than 0
    if (isNaN(chosenAmount) || chosenAmount <= 0) {
      return res.status(400).send("Invalid amount provided.");
    }

    const assignedAmount = type === "deposit" ? chosenAmount : -chosenAmount;

    const transaction = new Transaction(null, accountID, null, assignedAmount);
    await transaction.registerTransaction();
    res.redirect(`/account/${accountID}`);
    }catch (err) {
    console.error("Error updating account balance:", err.message);
    res.status(500).send("Failed to update account balance");
  }
}

//Evt få det sendt til account ejs fil frem for portfolio
//Få det indsat direkte i account ejs filen frem for at have seperate ejs fil
//På den måde cutter vi ned på antallet af ejs filer og gør det mere overskueligt

module.exports = { showTransactions, handleAccountTransaction };
