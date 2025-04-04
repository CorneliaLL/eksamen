class AccountController{

    withdrawAmount(req, res){
        const { currency, amount } = req.body

        res.send("3")

        console.log(currency, amount)
    }
}

function createAccount(){

}

module.exports = { 
    AccountController,
    createAccount
}