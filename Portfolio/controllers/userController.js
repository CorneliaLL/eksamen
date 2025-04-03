const users = [
    {
        id: 1, 
        name: "cornelia",
    }
]

//class for user routes
class UserController{
    //controller = function that handles req and res
    getAllUsers(req, res){
        res.json(users)

    }

    getSingleUser(req, res){
        res.json(users[0])
    }

    viewAccount(req, res){
        

    }

}

/*
functions to include

logOut - because it is about "clearing the session"

viewAccount - calls for accountModel + 
*/ 

//exporting class for using elsewhere
module.exports = { UserController }

