class AuthController{
    
    login(req, res){
        console.log(req.body)

        const { username, password } = req.body;

        res.send("1")
    }

    logout(req, res){
        console.log(req.body)

        const { } = req.body; 
        res.send("you have logged out")
    }

    signup(req, res){
        const {username, email, password} = req.body

        

        console.log(username, email, password)

        console.log(username.length < 3)
        if(username.length < 3){
            res.send("username has to be more than 3 characters")
        } else {
            res.send("you have signed up")

        }
    }
}

module.exports = new AuthController()