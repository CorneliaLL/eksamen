const { User } = require("../models/userModels");
const { Portfolio } = require("../models/portfolioModels");
const { PriceHistory} = require("../models/stockModels")
 
//Validerer om password opfylder kravene 
 function validatePassword(password){
  if (!password || password.length < 8){
    return "Password has to be at least 8 characters";
  }
  if(!/[a-z]/.test(password)){
    return "Password has to include a lowercase letter";
  }
  if(!/[A-Z]/.test(password)){
    return "Password must include an uppercase letter";
  }
  if (!/[0-9]/.test(password)){
    return "Password has to include a number";
  }
  return null;
  }


//Behandler POST-request til oprettelse af ny bruger
async function signup (req, res){
    try {
      const { name, username, email, password } = req.body;

  //Validering af brugernavn
      if (!username || username.length < 3) {
        return res.status(400).json({ error: "Username must be at least 3 characters" });
      }
      
      //Validerer password vha metoden validatePassword()
      const passwordError = validatePassword(password);
      if (passwordError){
        return res.render("index", {
          error: passwordError,
          msg: null
        });
      }

      //Opretter en ny bruger-instans og gemmer i databasen
      const user = new User(null, name, username, email, password);
      await user.createUser();

      res.redirect("/user/dashboard");
      
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  //Henter og viser brugerens dashboard med porteføljeoversigt
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


      //Henter summerede værdier fra portfoliomodels
      const totalAcquisitionPrice = req.totalAcquisitionPrice;
      const totalRealizedValue = req.totalRealizedValue;
      const totalUnrealizedGain = req.totalUnrealizedGain;

      //Henter top-porteføljeværdier
      const topUnrealizedGains = await Portfolio.getTopUnrealizedGains(userID);
      const topRealizedValues = await Portfolio.getTopTotalValues(userID);
      
       //Tilføjer prisinfo til hvert aktie i toplistrrne 
        for (let item of topUnrealizedGains) {
            const priceInfo = await PriceHistory.getPriceInfo(item.ticker);
            item.priceInfo = priceInfo; 
        }

        for (let item of topRealizedValues) {
            const priceInfo = await PriceHistory.getPriceInfo(item.ticker);
            item.priceInfo = priceInfo; 
        }
      
      res.render("dashboard", {
        username: user.username,
        totalAcquisitionPrice,
        totalRealizedValue,
        totalUnrealizedGain,
        topUnrealizedGains,
        topRealizedValues
      });

    } catch (err) {
      res.status(500).send("Failed to render dashboard");
    }
  }

  //Logger en bruger ind ved at matche brugernavn og password (POST-req)
  async function login(req, res) {
    try {
      const { username, password } = req.body;
      const user = await User.findUserByUsername(username);
  
      if (!user) {
        return res.status(404).render("login", { error: "User not found" });
      } else if (user.password !== password) {
        return res.status(401).render("login", { error: "Incorrect password" });
      } else {
      
        req.session.userID = user.userID; //gemmer userID i session
        res.redirect("/user/dashboard");
    }
    } catch (err) {
      res.status(500).render("login", { error: "Login failed. Try again." });
    }
  }


  //Logger brugeren ud ved ar bryde session
  async function logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Failed to log out");
      }
      res.redirect("/");
    });
  }

//Viser formularen til at ændre adgangskoden
async function renderChangePassword(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) {
      return res.status(401).send("Unauthorized");
    }

    res.render("change-password");
  } catch (err) {
    res.status(500).send("Failed to load page");
  }
}

//Hådterer ændring af adgangskode efter login
async function changePassword(req, res) {
  try {
    const { username, oldPassword, newPassword } = req.body;

    const user = await User.findUserByUsername(username);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.password !== oldPassword) {
      return res.status.send("Old password is incorrect" );
    }

    // Opdaterer password i databasen
    await User.updateUserPassword(username, newPassword);
    res.redirect("/user/dashboard");
  } catch (err) {
    // Catch and handle any error
    res.status(500).send("Something went wrong while changing the password. Try again" )
  }
}

module.exports = { signup, login, renderChangePassword, changePassword, logout, renderDashboard }