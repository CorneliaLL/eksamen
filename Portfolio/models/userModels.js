class User {
    constructor (name, username, email, password, age){
        this.name = name; 
        this.username = username;
        this.email = email;
        this.password = password;
        this.age = age;
    }
}

module.exports = { User };