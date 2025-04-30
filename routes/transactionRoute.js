const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.get("/transactions/:accountID", transactionController.showTransactions);

router.post("/account/:accountID/transaction", transactionController.handleAccountTransaction)

module.exports = router;
