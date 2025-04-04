const { createUser, findUserByEmail } = require("../models/userModels");

/*
class AuthController{
    login(req, res){
        console.log(req.body)

        const { username, password } = req.body;

        res.send("1")
    }

    //logout empty 
    logout(req, res){

        res.send("you have logged out")
    }

    signup(req, res){
        const {username, email, password} = req.body

    
        console.log(username, email, password)

        console.log(username.length < 3)
        if(username.length < 3){
            res.send("username has to be more than 3 characters")
        } else {
            res.send("you have signed up")

        }
    }

    createAccount(req, res){
        console.log(req.body) 

        const { } = req.body 
        res.send('you have successfully created an account')
    }


}
    */

// SIGNUP controller – calls our createUser and sends respons to client
async function signup (req, res){
    try {
      const { name, username, email, password, age } = req.body;
  
      if (!username || username.length < 3) {
        return res.status(400).json({ error: "Username must be at least 3 characters" });
      }
  
      // Kalder modellen der gemmer i databasen
      const newUser = await createUser({ name, username, email, password, age });
  
      res.status(201).json({
        message: "User created successfully",
        user: newUser,
      });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  // LOGIN controller – checks credentials
async function login(req, res) {
    try {
      const { email, password } = req.body;
  
      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      if (user.password !== password) {
        return res.status(401).json({ error: "Incorrect password" });
      }
  
      res.status(200).json({
        message: "Login successful",
        user: {
          id: user.userID,
          username: user.username,
          email: user.email
        }
      });
  
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