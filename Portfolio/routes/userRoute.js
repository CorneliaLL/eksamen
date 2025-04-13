const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

//Show the form to change password
router.get("/change-password", (req, res) => {
    // Render the "change-password" view template and send it as the response
    res.render("change-password");
  });

router.get("/logout", (req, res) => {
    // If you're not using sessions, just redirect
    res.redirect("/");
  }); //https://www.loginradius.com/blog/engineering/guest-post/nodejs-authentication-guide/
  


//handles form submissions
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/change-password", userController.changePassword);


module.exports = router ;
