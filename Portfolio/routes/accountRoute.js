const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");

//router.post("/", accountController.);
//router.get("/accountOverview", )
//Route which fetches the accountID from the database 
router.get("/account/:accountID", accountController.getAccountByID);
router.get("/account", accountController.getAccounts);
router.get('/createAccount', (req, res) => {
    res.render('createAccount'); // Sørg for, at 'createAccountForm.ejs' findes i din 'views'-mappe
  });
router.post('/createAccount', accountController.createAccount);
//router.post("/account", accountController.getAccounts);
router.get("/deactivateAccount/:accountID", accountController.handleDeactivateAccount);
router.get("/reactivateAccount/:accountID", accountController.handleReactivateAccount)



module.exports = router ;