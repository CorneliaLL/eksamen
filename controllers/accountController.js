const { Account } = require("../models/accountModels");
const { Banks } = require("../models/bankModels");

// Henter alle banker fra databasen, som bruges til dropdown i UI
async function fetchBanks() {
  try {
    const banks = await Banks.getBanks();
    //Returnerer banklisten til kaldende funktion 
    return banks;
  } catch (err) {
    throw new Error("Failed to fetch banks");
  }
}

//Viser formularen til at oprette en ny konto
async function renderCreateAccount(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    res.render('createAccount');
  } catch (err) {
    res.status(500).send("Failed to fetch accounts");
  }
}

// Opretter en ny konto baseret på brugerens input 
async function createAccount(req, res) {
  try {
    //Henter form-data fra brugerens req (POST)
    const { accountName, currency, balance, bankName } = req.body;
    const userID = req.session.userID;
    const registrationDate = new Date();
    const accountStatus = true; //Kontoen oprettes som aktiv 

    if (!userID) {
      return res.status(401).send("Unauthorized");
    }

 
    //Validerer at den angivne bank eksisterer
    const validBank = await Banks.findBankByName(bankName);
    if (!validBank) {
      return res.status(400).send("Invalid bank ID");
    }

    // Henter bankID fra  valideret objekt 
    const bankID = validBank.bankID;
    //Opretter et nyt instans af account og kalder metoden til at gemme det
    const account = new Account(null, userID, accountName, currency, balance, registrationDate, accountStatus, bankID, null);
    await account.createNewAccount();

    res.redirect("/account"); // After creating account go back to overview
  } catch (err) {
   res.status(500).send("Failed to create account");
  }
}

// Viser alle konti for den enkelte bruger
async function getAccounts(req, res) {
    try {
      const userID = req.session.userID;

      if (!userID) {
        return res.status(401).send("Unauthorized");
      }
      
      //Henter alle konti tilknyttet brugeren 
      const accounts = await Account.getAllAccounts(userID);
      res.render("account", { accounts });
    } catch (err) {
      res.status(500).send("Failed to fetch accounts");
    }
  }

//Henter detaljer om en specifik konto baseret på ID
async function getAccountByID(req, res){
    try{
      const accountID = req.params.accountID; //Henter konto-ID fra URL
      const account = await Account.findAccountByID(accountID);
      if (!account) {
          return res.status(404).json({ error: "Account not found" });
      } else {

          res.render("accountDashboard", { 
            account, 
            portfolios: req.portfolios, 
            totalAcquisitionPrice: req.totalAcquisitionPrice
          });
      } 

    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
}
  
// Deaktiverer en konto. Sætter konto status til 0
async function handleDeactivateAccount(req, res) {
    try {
      const { accountID } = req.params;
      const deactivationDate = new Date();
      await Account.deactivateAccount(accountID, deactivationDate);
      res.redirect("/account");
    } catch (err) {
      res.status(500).send("Failed to deactivate account");
    }
  }
  
 //Genaktiverer konto ved at sætte status til 1
async function handleReactivateAccount(req, res) {
    try {
      const { accountID } = req.params;
      await Account.reactivateAccount(accountID);
      res.redirect("/account");
    } catch (err) {
      res.status(500).send("Failed to reactivate account");
    }
  }

module.exports = {
  fetchBanks,
  renderCreateAccount,
  createAccount,
  getAccountByID,
  handleDeactivateAccount,
  handleReactivateAccount,
  getAccounts
}
