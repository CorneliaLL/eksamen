const { expect } = require('chai'); // Importerer expect fra Chai til at lave assertions
const sinon = require('sinon'); // Importerer Sinon til at oprette stubs og mocks
const { createAccount } = require('../controllers/accountController'); // Importerer funktionen der testes
const { Account } = require('../models/accountModels'); // Importerer Account-model
const { Banks } = require('../models/bankModels'); // Importerer Banks-model

// Overordnet testgruppe for createAccount-funktionen
describe('createAccount()', () => {
  let req, res;

  // Før hver test: initialiserer en mock-request og response-objekter
  beforeEach(() => {
    req = {
      session: {}, // Bruges til at simulere logget ind bruger
      body: {}     // Indeholder formular-data (fra bruger)
    };
    res = {
      status: sinon.stub().returnsThis(), // Tillader chaining som res.status().send()
      send: sinon.stub(), // Stub til at overvåge res.send()
      redirect: sinon.stub() // Stub til at overvåge res.redirect()
    };
  });

  // Efter hver test: rydder alle stubs op
  afterEach(() => {
    sinon.restore();
  });

  // Gruppe: Test af adgangskontrol
  describe('Authentication', () => {
    it('should return 401 and user is not logged in', async () => {
      req.session.userID = null; // Simulerer at brugeren ikke er logget ind

      await createAccount(req, res); // Kalder funktionen

      expect(res.status.calledWith(401)).to.be.true; // Forvent status 401
      expect(res.send.calledWith("Unauthorized")).to.be.true; // Forvent korrekt fejlbesked
    });
  });

  // Gruppe: Validering af input
  describe('Validation', () => {
    it('should return 400 if bank is invalid', async () => {
      req.session.userID = 1; // Simulerer en logget ind bruger
      req.body = {
        accountName: "Testkonto",
        currency: "DKK",
        balance: 1000,
        bankName: "FakeBank"
      };

      // Stubber findBankByName til at returnere null (bank findes ikke)
      const stub = sinon.stub(Banks, 'findBankByName').resolves(null);

      await createAccount(req, res); // Kalder funktionen

      expect(stub.calledOnceWith("FakeBank")).to.be.true; // Tjek at stub blev kaldt korrekt
      expect(res.status.calledWith(400)).to.be.true; // Forvent status 400
      expect(res.send.calledWith("Invalid bankID")).to.be.true; // Forvent fejlbesked
    });
  });

  // Gruppe: Succesfuld kontooprettelse
  describe('Successful flow', () => {
    it('should successfully create account and redirect to account', async () => {
      req.session.userID = 1;
      req.body = {
        accountName: "Testkonto",
        currency: "DKK",
        balance: 1000,
        bankName: "ValidBank"
      };

      // Stubber bankopslag og kontooprettelse
      sinon.stub(Banks, 'findBankByName').resolves({ bankID: 5 });
      const createStub = sinon.stub(Account.prototype, 'createNewAccount').resolves();

      await createAccount(req, res); // Kalder funktionen

      expect(createStub.calledOnce).to.be.true; // Tjek at kontooprettelse blev forsøgt
      expect(res.redirect.calledWith("/account")).to.be.true; // Forvent redirect til kontooversigt
    });
  });

  // Gruppe: Fejlhåndtering
  describe('Error handling', () => {
    it('should return 500 on error', async () => {
      req.session.userID = 1;
      req.body = {
        accountName: "Testkonto",
        currency: "DKK",
        balance: 1000,
        bankName: "ValidBank"
      };

      // Simulerer fejl i databasen
      sinon.stub(Banks, 'findBankByName').throws(new Error("DB down"));

      await createAccount(req, res); // Kalder funktionen

      expect(res.status.calledWith(500)).to.be.true; // Forvent status 500
      expect(res.send.calledWith("Failed to create account")).to.be.true; // Forvent generisk fejlbesked
    });
  });
});



