const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const portfolioController = require("../controllers/portfolioController");

//router.post("/", accountController.);
//router.get("/accountOverview", )
//Route which fetches the accountID from the database 
router.get("/account/:accountID", portfolioController.getPortfolios);
router.get("/account", accountController.getAccounts);
router.get('/createAccount', (req, res) => {
    res.render('createAccount'); 
  });
router.post('/createAccount', accountController.createAccount);
//router.post("/account", accountController.getAccounts);
router.post("/account/deactivateAccount/:accountID", accountController.handleDeactivateAccount);
router.post("/account/reactivateAccount/:accountID", accountController.handleReactivateAccount);
router.post("/account/:accountID", accountController.getAccountByID);




module.exports = router ;