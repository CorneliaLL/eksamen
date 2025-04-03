//API
const express = require("express");
const app = express()

//middleware package
const cors = require("cors") 
const userController = require("./controllers/userController")
const authController = require("./controllers/authController")
const accountController = require("./controllers/accountController")
const dashboardController = require("./controllers/dashboardController")

app.use(express.static("public")); //makes content in public visible and accessible in the browser 
app.set("view engine", "ejs"); //makes it possible to show dynamic html-pages in ejs 
app.use(express.urlencoded({ extended: true })); //makes it possible to read data from html-formulares

app.use(cors()) //without we get errors when we get request to the endpoints 
app.use(express.json()) //without this we coukd not return json like we do in the /users  endpoint 

//endpoint = URL
//This is a API endpoint bc it returns data and not a html-page 
app.get("/data", (req, res) => {
    res.send("hello")
})

//welcome page for login/signup 
app.get("/", (req, res) => {
    res.render("index", { msg: "Welcome" });
})

//login post request (fetch req in frontend )

app.get('/users', userController.getAllUsers)

//{ id: 1, name: "cornelia", }
app.get('/users/1', userController.getSingleUser)
    
app.post('/login', authController.login)

app.post('/logout', authController.logout)

app.post('/signup', authController.signup)

app.post('/createAccount', authController.createAccount)

app.get('/viewAccount', userController.viewAccount)

app.post('/withdraw', accountController.withdrawAmount)

app.get('/dashboard', dashboardController.renderDashboard)











//port 3000
app.listen(3000)