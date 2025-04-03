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