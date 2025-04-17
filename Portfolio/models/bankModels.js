const { sql, connectToDB } = require("../database");

    class Banks {
        constructor(bankID, bankName){
            this.bankID = bankID;
            this.bankName = bankName;
        }
}

async function getBanks() {
    const query = "SELECT bankID, bankName FROM Banks";
    const [rows] = await db.execute(query);
    return rows; // Returns an array of bank objects
  }

  async function findBankByID(bankID) {
    const query = "SELECT bankID, bankName FROM Banks WHERE bankID = ?";
    const [rows] = await db.execute(query, [bankID]);
    return rows[0]; // Returns the bank object or undefined if not found
  }

  module.exports = {
    getBanks,
    findBankByID
  };