//Imports sql and connectToDB functions from /database
//this way we can store and manage users in the database
const { sql, connectToDb } = require("../database");

class User {
    constructor (userID, name, username, email, password, age){
        this.userID = userID;
        this.name = name; 
        this.username = username;
        this.email = email;
        this.password = password;
        this.age = age;
    }
}

/*
 createAccount() Burde måske bo i accountModel og accountController, ikke user

 Funktioner:

 signUp
 logIn

//Asyncronic function that handles sign up 
async function signUp({name, username, email, password, age}) {
    if (username.length < 3) {
        throw new Error("Username must be at least 3 characters");
    } 

//creates new user if the username is at least 3 characters
    const newUser = new User({
        name,
        username,
        email,
        password,
        age,
      });

    return {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      };
}
*/
module.exports = { User };