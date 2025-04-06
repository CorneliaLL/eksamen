class Account{
    constructor(accountID, userID, name, currency, balance, regDate, accountStatus, bankID){
        this.accountID = accountID;
        this.userID = userID;
        this.name = name;
        this.currency = currency;
        this.balance = balance;
        this.regDate = regDate;
        this.accountStatus = accountStatus;
        this.bankID = bankID;
    }
}

/* 
createAccount
funktioner:
editAccount()
deactivateAccount
reopenAccount
insertAmount
withdrawAmount
*/

module.exports = { Account };