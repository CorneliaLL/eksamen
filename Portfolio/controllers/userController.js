const { createUser, findUserByUsername, updateUserPassword } = require("../models/userModels");

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


  

async function changePassword(req, res) {
  try {
    const { username, oldPassword, newPassword } = req.body;

    /*await ensures that the code waits for the result before continuing.
    Without await, the code would continue with the next line before the user has been retrieved, which can cause errors*/
    const user = await findUserByUsername(username);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.password !== oldPassword) {
      return res.status(401).json({ error: "Old password is incorrect" });
    }

    // Update the user's password
    await updateUserPassword(username, newPassword);

    res.status(200).json({ message: "Password changed successfully" });
    
  } catch (err) {
    // Catch and handle any error
    res.status(500).json({ error: "Something went wrong while changing the password. Try again" });
  }
}


module.exports = { signup, login, changePassword }