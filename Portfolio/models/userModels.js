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

module.exports = { User };