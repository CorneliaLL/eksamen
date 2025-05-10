const { Transaction } = require("../models/transactionModels");
const { Account } = require("../models/accountModels");

// Viser transactioner for en given konto 
async function showTransactions(req, res) {
  try {
    const { accountID } = req.params;

    const transactions = await Transaction.getTransactions(accountID); //Henter alle transactioner for den givne konto
    const account = await Account.findAccountByID(accountID); // Henter konto info for den givne konto
  
    // renderer transactions view og sender alle hentede trasactioner
    res.render("transactions", { transactions, account });

  } catch (err) {
    console.error("Error showing transactions:", err.message);
    res.status(500).send("Could not load transactions");
  }
}


//Håndterer transactioner for en given konto 
async function handleAccountTransaction(req, res) {
  try{
    const { accountID } = req.params; 
    const { amount, type } = req.body; // Henter værdier fra formularen

    const account = await Account.findAccountByID(accountID); 
    if (account.accountStatus === false) {
      return res.status(403).send("Cannot update balance for a deactivated account");
    }
    const chosenAmount = parseFloat(amount);

    //tjekker og validerer at beløbet er et tal og er større end 0
    if (isNaN(chosenAmount) || chosenAmount <= 0) {
      return res.status(400).send("Invalid amount provided.");
    }

    //Tjekker om det er en indbetaling (deposit) eller en hævning (withdrawal)
    // Hvis det er en indbetaling tilføjes beløbet til kontoen, ellers trækkes det fra
    const assignedAmount = type === "deposit" ? chosenAmount : -chosenAmount; 

    //Opretter en ny transaction og registrer den i databasen 
    await Transaction.registerTransaction({
      accountID,
      tradeID: null,
      amount: assignedAmount
    });
    
    res.redirect(`/account/${accountID}`); 
    }catch (err) {
    console.error("Error updating account balance:", err.message);
    res.status(500).send("Failed to update account balance");
  }
}

module.exports = { showTransactions, handleAccountTransaction };
