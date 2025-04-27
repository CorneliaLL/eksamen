const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

//Show the form to change password
router.get("/change-password", (req, res) => {
    // Render the "change-password" view template and send it as the response
    res.render("change-password");
  });

//handles form submissions
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/change-password", userController.changePassword);
router.get("/dashboard", (req, res) => {
  if (!req.session.userID) {
    return res.redirect("/login");
  }
  res.render("dashboard", { userID: req.session.userID });
});

module.exports = router ;
