const express = require("express");
const session = require("express-session");
const app = express()
const { connectToDB } = require('./database.js');


app.use(express.json()) //without this we coukd not return json like we do in the /users  endpoint 
app.use(express.urlencoded({ extended: true })); //makes it possible to read data from html-formulares
app.use(express.static("public")); //makes content in public visible and accessible in the browser 
app.set("view engine", "ejs"); //makes it possible to show dynamic html-pages in ejs 

//Configure session middleware
app.use(
    session({
        secret: "token", //ret?
        resave: false, //Prevents resaving session if nothing has changed
        saveUninitialized: false, //DEn her skal måske ændres til false UNDERSØG
        cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 * 100000 },
    })
);

//Routes
const userRoutes = require('./routes/userRoute.js');
//const dashboardRoutes = require('./routes/dashboardRoute.js');
const accountRoutes = require('./routes/accountRoute.js');
const portfolioRoutes = require("./routes/portfolioRoute.js");
const stockRoutes = require('./routes/stockRoute.js');
const tradeRoutes = require('./routes/tradeRoute.js');
const transactionRoutes = require('./routes/transactionRoute');


app.get('/test-session', (req, res) => {
    if (!req.session.testdata) {
      req.session.testdata = "Hello, session!";
      console.log("Session has been set.");
    } else {
      res.send("Session is working: " + req.session.testdata);
    }
  });

//welcome page for login/signup 
app.get("/", (req, res) => {
    res.render("index", { msg: "Welcome" });
});


 //Isn't functional when we put it in userRoute.js, so for our log out to work we have put the endpoint here 
app.get("/logout", (req, res) => {
req.session.destroy((err) => {
    if (err) {
     console.error("Error destroying session:", err);
    return res.status(500).send("Failed to log out");
    }
    res.redirect("/"); // Redirect to the homepage after logout
    });
});



app.use('/user', userRoutes);
app.use('/', accountRoutes);
app.use("/", portfolioRoutes);
app.use('/stocks', stockRoutes);
app.use('/', tradeRoutes);
app.use('/', transactionRoutes); 



//port 3000
app.listen(3000, async () => {
  await connectToDB(); 
  console.log('Server is running on http://localhost:3000');
  });
