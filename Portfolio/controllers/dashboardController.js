function renderDashboard(req, res) {
    //dummy data
    const username = "Celina"; //hardcoded username 
    const totalVaerdi = "a";
    const realiseretGevinst = "a"; 
    const urealisaretGevinst = "a";
  
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