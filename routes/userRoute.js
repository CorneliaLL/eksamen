const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const portfolioController = require("../controllers/portfolioController");

router.get("/dashboard", portfolioController.getPortfolios, userController.renderDashboard);
router.get("/change-password", userController.renderChangePassword);

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/change-password", userController.changePassword);


module.exports = router ;
