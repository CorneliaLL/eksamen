const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");

//router.post("/", accountController.);
//Route which fetches the accountID from the database 
router.get("/account/:accountID", accountController.getAccountByID);




module.exports = router ;