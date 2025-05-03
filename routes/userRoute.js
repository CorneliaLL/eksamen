const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/dashboard", userController.renderDashboard);
router.get("/change-password", userController.renderChangePassword);
//handles form submissions
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/change-password", userController.changePassword);


module.exports = router ;
