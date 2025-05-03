const { Account } = require("../models/accountModels");
const { Banks } = require("../models/bankModels");

async function fetchBanks(req, res) {
  try {
    const banks = await Banks.getBanks(); // Fetch all banks from the database
    return banks; // Return the list of banks
  } catch (err) {
    console.error("Error fetching banks:", err.message);
    throw new Error("Failed to fetch banks");
  }
}

async function renderCreateAccount(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    res.render('createAccount');
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Failed to fetch accounts");
  }
}

// Create a new account
async function createAccount(req, res) {
  try {
    const { accountName, currency, balance, bankName } = req.body;
    const userID = req.session.userID; //Accessing userID from session
    const registrationDate = new Date();
    const accountStatus = true;

    if (!userID) {
      return res.status(401).send("Unauthorized");
    }

    // Fetch all banks and validate the bankID
    //const banks = await findBankByName(bankName);
    const bank = new Banks();
    const validBank = await bank.findBankByName(bankName);
    if (!validBank) {
      return res.status(400).send("Invalid bank ID");
    }

    // Extract bankID from the bank chosen by user, so we can use it in createNewAccount function
    const bankID = validBank.bankID;
    const account = new Account(null, userID, accountName, currency, balance, registrationDate, accountStatus, bankID, null);
    await account.createNewAccount();

    res.redirect("/account"); // After creating account go back to overview
  } catch (err) {
    console.error("Error creating account:", err.message);
    res.status(500).send("Failed to create account");
  }
}

// Show list of all accounts
async function getAccounts(req, res) {
    try {
      console.log("Session data:", req.session); // Debugging: Check session data
      const userID = req.session.userID; // Accessing userID from session

      //Check if the userID is set in the session
      //If not it will return 401 error
      if (!userID) {
        return res.status(401).send("Unauthorized");
      }
      //Fetch all accounts for the user
      const accounts = await Account.getAllAccounts(userID);
      console.log("Fetched accounts:", accounts);
      res.render("account", { accounts });
    } catch (err) {
      res.status(500).send("Failed to fetch accounts");
    }
  }

//Async function that fecthes the accountID from the database
async function getAccountByID(req, res){
    try{
      const accountID = req.params.accountID;
      const account = await Account.findAccountByID(accountID);
      if (!account) {
          return res.status(404).json({ error: "Account not found" });
      } else {

          //change to res.render
          res.render("accountDashboard", { account, portfolios: req.portfolios });
      } 

    } catch (err) {
      console.error("Error in getAccountByID", err);
      res.status(500).json({ error: "Server error" });
    }
}
  
  // Deactivate an account (set status = 0)
async function handleDeactivateAccount(req, res) {
    try {
      const { accountID } = req.params;
      const deactivationDate = new Date();
      await Account.deactivateAccount(accountID, deactivationDate);
      res.redirect("/account");
    } catch (err) {
      console.error("Error deactivating account:", err.message);
      res.status(500).send("Failed to deactivate account");
    }
  }
  
  // Reactivate a deactivated account (set status = 1)
async function handleReactivateAccount(req, res) {
    try {
      const { accountID } = req.params;
      await Account.reactivateAccount(accountID);
      res.redirect("/account");
    } catch (err) {
      console.error("Error reactivating account:", err.message);
      res.status(500).send("Failed to reactivate account");
    }
  }

 /* //NOT DONE YET mangler ordentlig redirect
async function handleUpdateAccountBalance(req, res){
  try{
    const { accountID } = req.params;
    //ADD INPUTS IN EJS THAT CORRELATES
    const { amount, type } = req.body;

    const account = await Account.findAccountByID(accountID);
    if (account.accountStatus === false) {
      return res.status(403).send("Cannot update balance for a deactivated account");
    }
    const updatedBalance = parseFloat(amount);

    //Checks and validates that the amount is a number and is greater than 0
    if (isNaN(updatedBalance) || updatedBalance <= 0) {
      return res.status(400).send("Invalid amount provided.");
    }

    if (type === "deposit"){
      await Account.updateAccountBalance(accountID, updatedBalance)
    } else if (type === "withdrawal"){
      await Account.updateAccountBalance(accountID, -updatedBalance)
    } else {
      return res.status(400).send("Invalid transaction type. Must be 'deposit' or 'withdraw'.");
    } 
    res.redirect(`/account/${accountID}`);
    }catch (err) {
    console.error("Error updating account balance:", err.message);
    res.status(500).send("Failed to update account balance");
  }
}*/

  //Create functions about inserting amount on accounts
  //Withdrawal, plus making transfers not possible on deactivated accounts
module.exports = {
  fetchBanks,
  renderCreateAccount,
  createAccount,
  getAccountByID,
  handleDeactivateAccount,
  handleReactivateAccount,
  getAccounts
}
