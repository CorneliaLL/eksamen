const {Account, getAllAccounts, createNewAccount, deactivateAccount, reactivateAccount, findAccountByID } = require("../models/accountModels");

// Show list of all accounts
async function getAccounts(req, res) {
    try {
      const accounts = await getAllAccounts();
      res.render("accounts", { accounts });
    } catch (err) {
      console.error("Error fetching accounts:", err.message);
      res.status(500).send("Failed to fetch accounts");
    }
  }

//Async function that fecthes the accountID from the database
async function getAccountByID(req, res){
    try{
        const accountID = req.params.accountID;
        const account = await findAccountByID(accountID);
        if (!account) {
            return res.status(404).json({ error: "Account not found" });
        } else {

            //change to res.render
            res.render("accountDetail", { account });
        } 

    } catch (err) {
      console.error("Error in getAccountByID", err);
      res.status(500).json({ error: "Server error" });
    }
}

// Create a new account
async function createAccount(req, res) {
    try {
      const { userID, accountName, currency, balance, bankID } = req.body;
      const registrationDate = new Date();
      const accountStatus = true;
  
      await createNewAccount({ userID, accountName, currency, balance, registrationDate, accountStatus, bankID })
  
      res.redirect("/accountDashboard"); // After creating account go back to overview
    } catch (err) {
      console.error("Error creating account:", err.message);
      res.status(500).send("Failed to create account");
    }
  }
  
  // Deactivate an account (set status = 0)
  async function handleDeactivateAccount(req, res) {
    try {
      const { accountID } = req.params;
      await deactivateAccount(accountID);
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
      await reactivateAccount(accountID);
      res.redirect("/account");
    } catch (err) {
      console.error("Error reactivating account:", err.message);
      res.status(500).send("Failed to reactivate account");
    }
  }
module.exports = {
    getAccountByID,
    createAccount,
    handleDeactivateAccount,
    handleReactivateAccount,
    getAccounts
}
