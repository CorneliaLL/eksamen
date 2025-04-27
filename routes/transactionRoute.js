const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.get("/:accountID", transactionController.showTransactions);

module.exports = router;

