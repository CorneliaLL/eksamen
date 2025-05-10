const { sql, connectToDB } = require("../database");

class Banks {
  constructor(bankID, bankName){
    this.bankID = bankID;
            this.bankName = bankName;
        }
      //Metode der henter alle banker fra databasen
        static async getBanks() {
          const pool = await connectToDB();
        
          const result = await pool.request()
            .query(`
              SELECT bankID, bankName
              FROM Banks
              `);
            //Returnerer hele listen af bankerne med deres bankID og bank navn
              return result.recordset;
          }

          //Henter en bank i databasen ved at matche bankID
          static async findBankByName(bankName) {
            const pool = await connectToDB();
            const result = await pool.request()
              .input("bankName", sql.NVarChar, bankName)
              .query("SELECT bankID FROM Banks WHERE bankName = @bankName");
          
            return result.recordset[0];
          }

}

  module.exports = {
    Banks
  };