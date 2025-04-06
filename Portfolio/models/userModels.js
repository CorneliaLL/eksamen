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

//Asyncronic function we use to create and store users in the DB
//Function takes the users data and inserts the new user in our DB through a SQL INSERT statement
async function createUser({ name, username, email, password, age }){
    const pool = await connectToDb();

//creates the connection to the DB
// Creates our request, SQL queries.
    await pool.request()
    .input("name", sql.NVarChar, name)
    .input("username", sql.NVarChar, username)
    .input("email", sql.NVarChar, email)
    .input("password", sql.NVarChar, password)
    .input("age", sql.Int, age)

//Query = what is actually being sent to the DB
// @x matches our input from above. Inserts the data into a new row in the user table with the given values
//.query is a method from mssql which handles SQL queries to our DB
    .query(`
      INSERT INTO Users (name, username, email, password, age)
      VALUES (@name, @username, @email, @password, @age)
    `);

    return { username, email };
}

async function findUserByEmail(email) {
    const pool = await connectToDb();

    const result = await pool.request()
        .input("email", sql.NVarChar, email)
        .query("SELECT * FROM  Users WHERE email = @email");

//Returns the first instance in the DB that matches our query, or undefined
//recordset - property from .query which is a method.
    return result.recordset[0];
}

/*
 createAccount() Burde måske bo i accountModel og accountController, ikke user

 Funktioner:

 signUp
 logIn
*/
module.exports = { 
    User,
    createUser,
    findUserByEmail
 };