const { expect } = require ('chai'); //imports expect from Chai - used to write whats expected 
const sinon = require ('sinon'); //import sinon - used to make fake functions 
const { handleTrade } = require ('../controllers/tradeController.js'); //import wanted to test trade function 
const { Trade } = require ('../models/tradeModels.js'); 
const { Stocks } = require ('../models/stockModels.js');
const { Account } = require ('../models/accountModels.js');
const  fetchExchangeRate  = require ('../services/fetchExchangeRate.js');
const { Transaction } = require ('../models/transactionModels.js')


describe('handle trade function', () => {
    let req, res;
        
        //runs before each test and makes new req and res objects 
        beforeEach(() => {
            req = { 
                body: {
                    portfolioID: 6,
                    accountID: 5,
                    Ticker:'AAPL',
                    tradeType: 'buy',
                    quantity: 10
                }, //username and password in each test
                session: {
                    userID: 1,
                } //saves users session information during login 
            };
            
            //fake express res obejct 
            res = { 
                status: sinon.stub().returnsThis(), //possible to use res.status and render
                render: sinon.stub(), //checks if render gets used correctly
                redirect: sinon.stub() //checks if redirect gets used correctly
            };
                // Mock data
            sinon.stub(Stocks, 'findStockByTicker').resolves({
                Ticker: 'AAPL',
                StockID: 1,
                StockName: 'Apple Inc.',
                StockCurrency: 'USD',
                ClosePrice: 100
            });
  
            sinon.stub(Account, 'findAccountByID').resolves({
                accountID: 1,
                currency: 'USD',
                accountStatus: true
            });
  
            sinon.stub(fetchExchangeRate, 'storeExchangeRate').resolves(1); // No currency conversion needed
            sinon.stub(Trade, 'checkFunds').resolves(false); // Simulate insufficient funds
            });

        //cleans after each test and removes all fakes (stubs)
        afterEach(() => {
            sinon.restore();
        });
    
        it('render trade page with error if insufficient funds', async () => {
            await handleTrade(req, res);
    
            expect(res.render.calledOnce).to.be.true;
            const [view, context] = res.render.firstCall.args;
            expect(view).to.equal('trade');
            expect(context.error).to.equal('Insufficient funds');
        });
});
