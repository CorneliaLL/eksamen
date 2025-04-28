const express = require("express");
const router = express.Router();
const tradeController = require("../controllers/tradeController");

router.get("/trade", tradeController.handleTrade)
router.post("/trade", tradeController.handleTrade);

module.exports = router;
