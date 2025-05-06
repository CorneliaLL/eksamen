const { User } = require("../models/userModels");
const { Account } = require("../models/accountModels");
const { Portfolio } = require("../models/portfolioModels");
 
//validates password and return an error-message if not true 
 function validatePassword(password){
  //checks if password is long enough
  if (!password || password.length < 8) {
    return "Password has to be at least 8 characters";
  }
  //checks if password has at least one lowercase letter
  if(!/[a-z]/.test(password)){
    return "Password has to include a lowercase letter";
  }
  //checks if password has at least one uppercase letter
  if(!/[A-Z]/.test(password)){
    return "Password must include an uppercase letter";
  }
  //checks if password has at least one number 
  if (!/[0-9]/.test(password)){
    return "Password has to include a number";
  }
  //if all criteria are fulfilled then returns null 
  return null; //password is valid 
  }

// SIGNUP controller – handles user registration and stores the new user in our DB
async function signup (req, res){
    try {
      const { name, username, email, password, age } = req.body;

  //Signup validation - username must be at least 3 characters
      if (!username || username.length < 3) {
        return res.status(400).json({ error: "Username must be at least 3 characters" });
      }
      
      //validates password from function
      const passwordError = validatePassword(password);
      if (passwordError){
        return res.render("index", {
          error: passwordError,
          msg: null
        });
      }
  
      // Variable that calls the createUser function from userModels to save the user in our DB
      const user = new User(null, name, username, email, password, age );
      await user.createUser();

      res.redirect("/dashboard");
      
      //Catch error that sends server error respons if sign up is a fail
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  async function renderDashboard(req, res) {
    try {
      const userID = req.session.userID;
      if (!userID) {
        return res.status(401).send("Unauthorized");
      }
      const user = await User.findUserID(userID);
      if (!user) {
        return res.status(404).send("User not found");
      }
      
      const totals = await Portfolio.getTotalValue(userID);
      const totalAcquisitionPrice = totals.totalAcquisitionPrice || 0;
      const totalRealizedValue = totals.totalRealizedValue || 0;
      const totalUnrealizedGain = totals.totalUnrealizedGain || 0;
     
      res.render("dashboard", {
        username: user.username,
        totalAcquisitionPrice,
        totalRealizedValue,
        totalUnrealizedGain
      });

    } catch (err) {
      console.error("Error in renderDashboard;", err.message);
      res.status(500).send("Failed to render dashboard");
    }
  }

  async function login(req, res) {
    try {
      const { username, password } = req.body;
      //Måske skal være static
      const user = await User.findUserByUsername(username);
  
      if (!user) {
        return res.status(404).render("login", { error: "User not found" });
      } else if (user.password !== password) {
        return res.status(401).render("login", { error: "Incorrect password" });
      } else {
      
        req.session.userID = user.userID; // Store user in session
        res.redirect("/dashboard");
    }
    } catch (err) {
      res.status(500).render("login", { error: "Login failed. Try again." });
    }
  }


  async function logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send("Failed to log out");
      }
      res.redirect("/");
    });
  }

async function renderChangePassword(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) {
      return res.status(401).send("Unauthorized");
    }

    res.render("change-password");
  } catch (err) {
    console.error("Error rendering change password page:", err);
    res.status(500).send("Failed to load page");
  }
}

async function changePassword(req, res) {
  try {
    const { username, oldPassword, newPassword } = req.body;

    /*await ensures that the code waits for the result before continuing.
    Without await, the code would continue with the next line before the user has been retrieved, which can cause errors*/
    const user = await User.findUserByUsername(username);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.password !== oldPassword) {
      return res.status(401).json({ error: "Old password is incorrect" });
    }

    // Update the user's password
    await User.updateUserPassword(username, newPassword);
    //res.status(200).json({ message: "Password changed successfully" });
    res.redirect("/dashboard");
  } catch (err) {
    // Catch and handle any error
    res.status(500).json({ error: "Something went wrong while changing the password. Try again" });
  }
}


module.exports = { signup, login, renderChangePassword, changePassword, logout, renderDashboard }