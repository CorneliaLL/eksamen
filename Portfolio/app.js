const express = require("express");
const app = express()
//middleware package
const cors = require("cors") 

app.use(cors()) //without we get errors when we get request to the endpoints 
app.use(express.json()) //without this we coukd not return json like we do in the /users  endpoint 
app.use(express.urlencoded({ extended: true })); //makes it possible to read data from html-formulares
app.use(express.static("public")); //makes content in public visible and accessible in the browser 
app.set("view engine", "ejs"); //makes it possible to show dynamic html-pages in ejs 


//Routes
const userRoutes = require('./routes/userRoute.js');
const dashboardRoutes = require('./routes/dashboardRoute.js')
const accountRoutes = require('./routes/accountRoute.js')

//welcome page for login/signup 
app.get("/", (req, res) => {
    res.render("index", { msg: "Welcome" });
});


app.get("/accountOverview", (req, res) => {
    res.render("accountOverview");
});

app.get('/createAccount', (req, res) => {
    res.render('createAccount');
  });

//
app.use('/user', userRoutes);
app.use('/dashboard', dashboardRoutes)
app.use('/', accountRoutes);

//Standard routes
//endpoint = URL
//This is a API endpoint bc it returns data and not a html-page 
app.get("/data", (req, res) => {
    res.send("hello")
})






app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });
