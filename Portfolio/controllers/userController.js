const { createUser, findUserByUsername } = require("../models/userModels");

// SIGNUP controller – handles user registration and stores the new user in our DB
async function signup (req, res){
    try {
      const { name, username, email, password, age } = req.body;

  //Signup validation - username must be at least 3 characters
      if (!username || username.length < 3) {
        return res.status(400).json({ error: "Username must be at least 3 characters" });
      }
  
      // Variable that calls the createUser function from userModels to save the user in our DB
      const newUser = await createUser({ name, username, email, password, age });
  
      //Sends us a response that the sign up is a success
      res.status(201).json({
        message: "User created successfully",
        user: newUser,
      });

      res.redirect("/dashboard");
  
      //Catch error that sends server error respons if sign up is a fail
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  async function login(req, res) {
    try {
      const { username, password } = req.body;
      const user = await findUserByUsername(username);
  
      if (!user) {
        return res.status(404).render("login", { error: "User not found" });
      } else if (user.password !== password) {
        return res.status(401).render("login", { error: "Incorrect password" });
      } else {
  
      // Success – redirect to dashboard
      res.redirect("/dashboard");
    }
    } catch (err) {
      res.status(500).render("login", { error: "Login failed. Try again." });
    }
  }

// changePassword, logOut


module.exports = { signup, login }