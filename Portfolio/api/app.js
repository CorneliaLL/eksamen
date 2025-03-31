//API
const express = require("express")

const cors = require("cors")
const userController = require("./controllers/userController")
const authController = require("./controllers/authController")
const accountController = require("./controllers/accountController")

const app = express()
app.use(cors()) //without we get errors when we get request to the endpoints 
app.use(express.json()) //without this we coukd not return json like we do in the /users  endpoint 

//endpoint = URL
//This is a API endpoint bc it returns data and not a html-page 
app.get("/data", (req, res) => {
    res.send("hello")
})

//login post request (fetch req in frontend )

app.get('/users', userController.getAllUsers)

//{ id: 1, name: "cornelia", }
app.get('/users/1', userController.getSingleUser)
    
app.post('/login', authController.login)

app.post('/signup', authController.signup)

app.post('/withdraw', accountController.withdrawAmount)


app.listen(3001)