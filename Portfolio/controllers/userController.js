const { createUser, findUserByUsername, updateUserPassword } = require("../models/userModels");
 
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
      const newUser = await createUser({ name, username, email, password, age });
      /*
      //Sends us a response that the sign up is a success
      res.status(201).json({
        message: "User created successfully",
        user: newUser,
      });
      */
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
    //res.status(200).json({ message: "Password changed successfully" });
    res.redirect("/dashboard");
  } catch (err) {
    // Catch and handle any error
    res.status(500).json({ error: "Something went wrong while changing the password. Try again" });
  }
}


module.exports = { signup, login, changePassword, logout }