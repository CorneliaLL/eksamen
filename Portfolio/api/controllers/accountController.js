class AccountController{

    withdrawAmount(req, res){
        const { currency, amount } = req.body

        res.send("3")

        console.log(currency, amount)
    }
}

module.exports = new AccountController()