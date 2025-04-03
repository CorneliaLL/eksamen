class Account{
    constructor(accountID, userID, currency, balance, regDate, accountStatus, bankID){
        this.accountID = accountID;
        this.userID = userID;
        this.currency = currency;
        this.balance = balance;
        this.regDate = regDate;
        this.accountStatus = accountStatus;
        this.bankID = bankID;
    }
}

/* 
funktioner:
editAccount()
deactivateAccount
reopenAccount
insertAmount
withdrawAmount
*/

module.exports = { Account };