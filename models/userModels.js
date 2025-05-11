const { sql, connectToDB } = require("../database");


class User {
    constructor (userID, name, username, email, password){
        this.userID = userID;
        this.name = name; 
        this.username = username;
        this.email = email;
        this.password = password;
    }
//Metode der opretter en ny bruger i databasen
async createUser(){
    const pool = await connectToDB();

    //Indsætter en ny bruger i databasen
    const result = await pool.request()
    .input("name", sql.NVarChar, this.name)
    .input("username", sql.NVarChar, this.username)
    .input("email", sql.NVarChar, this.email)
    .input("password", sql.NVarChar, this.password)

    //@[værdi] matcher vores input og indsætter værdierne i en ny række i vores Users tabel
    //.query er en metode som håndterer SQL forespørgsler til vores DB
    .query(`
      INSERT INTO dbo.Users (name, username, email, password)
      OUTPUT INSERTED.userID
      VALUES (@name, @username, @email, @password)
    `);
    const userID = result.recordset[0].userID;
    this.userID = userID;

    return { userID, username: this.username };
    }

//Metode der finder en bruger i databasen ved at matche brugerID
static async findUserID(userID) {
    const pool = await connectToDB();

    const result = await pool.request()
        .input("userID", sql.Int, userID)
        .query("SELECT * FROM  Users WHERE userID = @userID");

//Returner den første instans i DB der matcher forespørgslen, eller undefined
    return result.recordset[0];
    }

//Metode der finder en bruger i databasen ved at matche brugernavnet
static async findUserByUsername(username) {
    const pool = await connectToDB();

    const result = await pool.request()
        .input("username", sql.NVarChar, username)
        .query("SELECT * FROM  Users WHERE username = @username");

    return result.recordset[0];
    }

//Metode der opdaterer brugers kodeord i databasen
static async updateUserPassword(username, newPassword) {
    const pool = await connectToDB();

    await pool.request()
    .input("username", sql.NVarChar, username)
    .input("password", sql.NVarChar, newPassword)
    //Opdaterer brugers kodeord i databasen ved at matche brugernavnet
    .query("UPDATE Users SET password = @password WHERE username = @username");
    }

}

module.exports = { 
    User
 };