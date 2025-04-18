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
    .query(`
      SELECT bankID, bankName
      FROM Banks
      `);
    //Returns the whole list
      return result.recordset;
  }

  async function findBankByName(bankName) {
    const pool = await connectToDB();
    const result = await pool.request()
      .input("bankName", sql.NVarChar, bankName)
      .query("SELECT bankID FROM Banks WHERE bankName = @bankName");
  
    return result.recordset[0];
  }
  

  module.exports = {
    getBanks,
    findBankByName
  };