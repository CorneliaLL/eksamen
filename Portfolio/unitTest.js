const { expect } = require('chai'); //importn chai to use expect from chai
const { login } = require('../loginController'); //import login function

describe('Login Function', () => { //describe: group related tests 
    it('logs in successfully with correct information', () => { //it describes test - what we expect
        const result = login('', ''); //real information
        expect(result.success).to.be.true;
        expect(result.token).to.equal('Login successful');
    });

    it('fails to login with incorrect username', () => {
        const result = login('wronguser', ''); //tests username if username is wrong
        expect(result.success).to.be.false; //expects login to fail 
        expect(result.message).to.equal('Invalid username'); //message
    });

    it('fails to log in with incorrect password', () => {
        const result = login('', 'wrongpassword');
        expect(result.success).to.be.false; //expects login to fail (false)
        expect(result.message).to.equal('Wrong password');
    });
});