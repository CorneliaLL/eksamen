const express = require("express");
const session = require("express-session");
const app = express()
const { connectToDB } = require('./database.js');


//Middleware setup
//Gør det muligt at parse JSON og form data fra requests
app.use(express.json()) 
app.use(express.urlencoded({ extended: true })); 
//Gør det muligt at se css og js-filer i browseren
app.use(express.static("public")); 
//Sætter EJS som view engine, så vi kan bruge EJS til at generere HTML
app.set("view engine", "ejs");  


//Oprettelse af session - så vi holder brugeren logget ind 
app.use(
    session({
        secret: "wiqpghwrg34u3hn", //Hemmelig nøgle til at gemme sessionen
        resave: false, 
        saveUninitialized: false, 
        cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 * 100000 },
    })
);

//Brugt til test af session (kun brugt til udvikling)
app.get('/test-session', (req, res) => {
    if (!req.session.testdata) {
      req.session.testdata = "Hello, session!";
      console.log("Session has been set.");
    } else {
      res.send("Session is working: " + req.session.testdata);
    }
  });


//Standard route for at vise forsiden
app.get("/", (req, res) => {
    res.render("index", { msg: "Welcome" });
});

//Isn't functional when we put it in userRoute.js, so for our log out to work we have put the endpoint here 
//Log ud route.
//Placeret her fordi den ikke fungerede i userRoute 
//Sletter sessionen og vidersender til forsiden
app.get("/logout", (req, res) => {
req.session.destroy((err) => {
    if (err) {
     console.error("Error destroying session:", err);
    return res.status(500).send("Failed to log out");
    }
    res.redirect("/"); // Redirect to the homepage after logout
    });
});


//Importering af routes
const userRoutes = require('./routes/userRoute.js');
const accountRoutes = require('./routes/accountRoute.js');
const portfolioRoutes = require("./routes/portfolioRoute.js");
const stockRoutes = require('./routes/stockRoute.js');
const tradeRoutes = require('./routes/tradeRoute.js');
const transactionRoutes = require('./routes/transactionRoute');

//Tilknytter vores routes til endpoints
app.use('/user', userRoutes);
app.use('/', accountRoutes);
app.use("/", portfolioRoutes);
app.use('/stocks', stockRoutes);
app.use('/', tradeRoutes);
app.use('/', transactionRoutes); 


//Starter serveren og opretter forbindelse til database
app.listen(3000, async () => {
  await connectToDB(); 
  console.log('Server is running on http://localhost:3000');
  });
