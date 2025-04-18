const { findUserByUsername } = require("../models/userModels");

function renderDashboard(req, res) {
    //dummy data
    const username = username ; //hardcoded username 

  
    //list to show 
    const topVaerdiListe = [];
    const topProfitListe = [];
  
    res.render("dashboard", {
      username,
      totalVaerdi,
      realiseretGevinst,
      urealisaretGevinst,
      topVaerdiListe,
      topProfitListe
    });
  }

  
module.exports = { renderDashboard }


//bruges ikke??
//evt ryk til user routes?