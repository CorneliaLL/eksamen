//Imports sql and connectToDB functions from /database
//this way we can store and manage users in the database
const { sql, connectToDB } = require("../database");


class User {
    constructor (userID, name, username, email, password, age){
        this.userID = userID;
        this.name = name; 
        this.username = username;
        this.email = email;
        this.password = password;
        this.age = age;
    }
    //Asyncronic function we use to create and store users in the DB
    //Function takes the users data and inserts the new user in our DB through a SQL INSERT statement
async createUser(){
    const pool = await connectToDB();

    //creates the connection to the DB
    // Creates our request, SQL queries.
    // uses .this to access the class properties
    await pool.request()
    .input("name", sql.NVarChar, this.name)
    .input("username", sql.NVarChar, this.username)
    .input("email", sql.NVarChar, this.email)
    .input("password", sql.NVarChar, this.password)
    .input("age", sql.Int, this.age)

    //Query = what is actually being sent to the DB
    // @x matches our input from above. Inserts the data into a new row in the user table with the given values
    //.query is a method which handles SQL queries to our DB
    .query(`
      INSERT INTO dbo.Users (name, username, email, password, age)
      VALUES (@name, @username, @email, @password, @age)
    `);

    return { username, email };
}

static async findUserID(userID) {
    const pool = await connectToDB();

    const result = await pool.request()
        .input("userID", sql.Int, userID)
        .query("SELECT * FROM  Users WHERE userID = @userID");

//Returns the first instance in the DB that matches our query, or undefined
//recordset - property from .query which is a method.
    return result.recordset[0];
}

static async findUserByUsername(username) {
    const pool = await connectToDB();

    const result = await pool.request()
        .input("username", sql.NVarChar, username)
        .query("SELECT * FROM  Users WHERE username = @username");

//Returns the first instance in the DB that matches our query, or undefined
//recordset - property from .query which is a method.
    return result.recordset[0];
}

static async updateUserPassword(username, newPassword) {
    const pool = await connectToDB();

    //Update the password of the user with the given username

    await pool.request()
    .input("username", sql.NVarChar, username)
    .input("password", sql.NVarChar, newPassword)
    .query("UPDATE Users SET password = @password WHERE username = @username");
}

}

/*
 createAccount() Burde måske bo i accountModel og accountController, ikke user

*/
module.exports = { 
    User
 };