import { expect } from 'chai'; //imports expect from Chai - used to write whats expected 
import sinon from 'sinon'; //import sinon - used to make fake functions 
import { login } from '../controllers/userController.js'; //import wanted to test login function 
import User from '../models/userModels.js'; //import user model with .findUserByUsername

describe('login', () => { //describe: all login in groups 
    let req, res;
    
    //runs before each test and makes new req and res objects 
    beforeEach(() => {
        req = { 
            body: {}, //username and password in each test
            session: {} //saves users session information during login 
        };
        
        //fake express res obejct 
        res = { 
            status: sinon.stub().returnsThis(), //possible to use res.status and render
            render: sinon.stub(), //checks if render gets used correctly
            redirect: sinon.stub() //checks if redirect gets used correctly
        };
    });

    //cleans after each test and removes all fakes (stubs)
    afterEach(() => {
        sinon.restore();
    });

    //test 1 - user does not exist 
    it('should show "User not found"', async () => { //it describes test - what we expect
       req.body = { username: 'unknown', password: 'test' };
       //fakes findUserByUsername to return null (user not found)
       sinon.stub(User, 'findUserByUsername').resolves(null); //??

       //runs login function 
       await login(req, res);
        
       //expects statuscode 404
        expect(res.status.calledWith(404)).to.be.true;
        //expects error message 
        expect(res.render.calledWith('login', { error: 'user not found' })).to.be.true;
    });

    //test 2 - wrong password 
    it('should show "Incorrect password"', async () => {
        req.body = { username: 'testuser', password: 'forkert' };
       //user exist but password is incorrect 
        sinon.stub(User, 'findUserByUsername').resolves({ password: 'rigtigt' });
       
        await login(req, res);

        //expects statuscode 401 
        expect(res.status.calledWith(401)).to.be.true; //expects login to fail 
        //expects error message 
        expect(res.render.calledWith('login', {error: 'Incorrect password' })).to.be.true; 
    });

    //test 3 - correct login 
    it('should login correct', async () => {
        req.body = { username: 'testuser', password: 'correct' };
        //Username and password is correct
        sinon.stub(User, 'findUserByUsername').resolves({ userID: 1, password: 'rigtigt' });

        await login(req, res);

        //expects userID saved in session
        expect(req.session.userID).to.equal(1);
        //expects user to get redirected to dashboard 
        expect(res.redirect.calledWith('/dashboard')).to.be.true;
    });
});

//npm install --save-dev mocha chai sinon
//package.json: scripts; test: mocha 
//kør test: npm test
//stub: fake (fx an already existing function)