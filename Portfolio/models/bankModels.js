const { sql, connectToDB } = require("../database");

class Banks {
  constructor(bankID, bankName){
    this.bankID = bankID;
            this.bankName = bankName;
        }
}

async function getBanks() {
  const pool = await connectToDB();

  const result = await pool.request()
    .input("userID", sql.Int, userID)
    .query(`
      SELECT bankID, bankName
      FROM Banks
      `);
    //Returns the whole list
      return result.recordset;
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