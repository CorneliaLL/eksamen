const { expect } = require('chai'); // Assertion-bibliotek til at skrive forventede resultater
const sinon = require('sinon'); // Bibliotek til at lave stubs og mocks
const { login } = require('../controllers/userController.js'); // Importerer login-funktionen som skal testes
const { User } = require('../models/userModels.js'); // Bruger-modellen som bruges i login-funktionen
const { describe, it, beforeEach, afterEach } = require('mocha'); // Mocha test-funktioner

// Overordnet testgruppe for login-funktionalitet
describe('login functionality', () => {
    let req, res;

    //før hver test laves nye req og res objekter med stub funktioner
    beforeEach(() => {
        req = {
            body: {}, //bruges til at sende username og password 
            session: {} //simulerer session objektet
        };

        res = {
            status: sinon.stub().returnsThis(), //bruges til at kæde res metoder sammen
            render: sinon.stub(), //stub til at teste visning af sider
            redirect: sinon.stub() //stub til at teste redirect ved succes
        };
    });

    //rydder op efter hver test så stubs fra tidligere tests ikke påvirker andre tests
    afterEach(() => {
        sinon.restore();
    });

    //fejlsituationer ved login
    describe('Invalid login', () => {

        //test1: Bruger eksisterer ikke
        it('should return 404 and show "User not found"', async () => {
            req.body = { username: 'unknown', password: 'test123' };

            //stubber til at returnere null - bruger ikke fundet
            sinon.stub(User, 'findUserByUsername').resolves(null);

            await login(req, res);

            //tjekker at status 404 blev sendt
            expect(res.status.calledWith(404)).to.be.true;

            //tjek at login siden viser korrekt fejlbesked
            expect(res.render.calledWith('login', { error: 'User not found' })).to.be.true;
        });

        // Test: Forkert kodeord → forvent 401 og vis fejlbesked
        it('should return 401 and show "Incorrect password"', async () => {
            req.body = { username: 'testuser', password: 'wrongpass' };

            // Stubber bruger-søgning til at returnere bruger med forkert password
            sinon.stub(User, 'findUserByUsername').resolves({
                userID: 1,
                password: 'correctpass' // rigtig kodeord, men brugeren indtaster forkert
            });

            await login(req, res);

            // Forventer status 401
            expect(res.status.calledWith(401)).to.be.true;

            // Forventer fejlbesked vises
            expect(res.render.calledWith('login', { error: 'Incorrect password' })).to.be.true;
        });
    });

    // Testgruppe for korrekt login
    describe('Valid login', () => {

        // Test: Login med korrekt kodeord → gem userID og redirect
        it('should login successfully and redirect to dashboard', async () => {
            req.body = { username: 'testuser', password: 'correctpass' };

            // Stubber bruger-søgning til at returnere en bruger med samme password
            sinon.stub(User, 'findUserByUsername').resolves({
                userID: 1,
                password: 'correctpass'
            });

            await login(req, res);

            //forventer at userID gemmes i session når login er succesfuldt
            expect(req.session.userID).to.equal(1);

            //forventer redirect til dashboard
            expect(res.redirect.calledWith('/dashboard')).to.be.true;
        });
    });
});

//npm install --save-dev mocha chai sinon
//package.json: scripts; test: mocha 
//kør test: npm test
//stub: fake (fx an already existing function
//chai old version????