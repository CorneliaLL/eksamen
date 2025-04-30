const express = require("express");
const router = express.Router();
const { handleTrade } = require("../controllers/tradeController");

// show the trade form to the user
router.get("/trade", (req, res) => {
    res.render("trade");
});

//ny endpoint: post: search stock - gennem services 
//note: ticker data gennem server ikke frontend
//trade registrerer ikke stocks køb  


// handle the trade form submission
router.post("/trade", handleTrade);

module.exports = router;
