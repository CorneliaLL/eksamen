const { createUser, findUserByEmail } = require("../models/userModels");

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

  // LOGIN controller – checks if the log in is valid and verifies the users access
async function login(req, res) {
    try {
      const { email, password } = req.body;
  
    // Calls our findUserByEmail function from userModels to check if the user exists in our DB or not
      const user = await findUserByEmail(email);

    //Checks if the user exists
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      //Checks if the password is correct
      else if (user.password !== password) {
        return res.status(401).json({ error: "Incorrect password" });
      } else {
    
    //If everything is correct, returns a success response
      res.status(200).json({
        message: "Login successful",
        user: {
          id: user.userID,
          username: user.username,
          email: user.email
        }
      });
    }
    res.redirect("/dashboard");
  
    //Catch error, handles errors in the verification
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

/*
async function signup(req, res){
    try {
        const {username, email, password} = req.body
    
        console.log(username, email, password)
        console.log(username.length < 3)

        if(username.length < 3){
            return res.send("username has to be more than 3 characters")
        } else {
            return res.send("you have signed up")
        }
    } catch (error) {
        console.log(error);
    }
}
*/

module.exports = { signup, login }