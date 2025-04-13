const {Account, getAllAccounts, createAccount, deactivateAccount, reactivateAccount, findAccountByID } = require("../models/accountModels");

async function getAccountByID(req, res){
    try{
        const accountID = req.params.accountID;
        const account = await findAccountByID(accountID);
        if (!account) {
            return res.status(404).json({ error: "Account not found" });
        } else {
            res.status(200).json({ account});
        } 

    } catch (err) {
      console.error("Error in getAccountByID:", err);
      res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    getAccountByID
}
