const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const portfolioController = require("../controllers/portfolioController");

router.get("/account/:accountID", portfolioController.getPortfolios, accountController.getAccountByID);
router.get("/account", accountController.getAccounts);
router.get('/createAccount', accountController.renderCreateAccount);

router.post('/createAccount', accountController.createAccount);
router.post("/account/deactivateAccount/:accountID", accountController.handleDeactivateAccount);
router.post("/account/reactivateAccount/:accountID", accountController.handleReactivateAccount);
router.post("/account/:accountID", accountController.getAccountByID);

module.exports = router ;