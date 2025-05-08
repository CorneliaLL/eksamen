const { expect } = require ('chai'); //imports expect from Chai - used to write whats expected 
const sinon = require ('sinon'); //import sinon - used to make fake functions 
const { handleTrade } = require ('../controllers/tradeController.js'); //import wanted to test trade function 
const { Trade } = require ('../models/tradeModels.js'); 
const { Stocks } = require ('../models/stockModels.js');
const { Account } = require ('../models/accountModels.js');
const  fetchExchangeRate  = require ('../services/fetchExchangeRate.js');
const { Transaction } = require ('../models/transactionModels.js') //fordi handleTrade?

//Unittest for handleTrade function
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
                redirect: sinon.stub(), //checks if redirect gets used correctly
                send: sinon.stub()
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
            sinon.stub(Trade, 'checkHoldings').resolves(false);
            });

        //cleans after each test and removes all fakes (stubs)
        afterEach(() => {
            sinon.restore();
        });

        describe('authentication', () => {
            it ('Return 401 if user is not logged in', async () => {
                req.session.userID = null;
                await handleTrade(req, res);

                expect(res.status.calledWith(401)).to.be.true;
                expect(res.status().send.calledWith("Unauthorized")).to.be.true;
            });
        });

        describe('input validation', () => {
            it ('Render trade page if there are empty input fields', async () => {
                req.body.Ticker = null;
                await handleTrade(req, res);

                expect(res.render.calledOnce).to.be.true;
                const [view, context] = res.render.firstCall.args;
                expect(view).to.equal('trade');
                expect(context.error).to.equal('All fields are required')

            })
        });

        describe('stock and account validation', () => {
            it('Return error if stock is not found in database', async () => {
                Stocks.findStockByTicker.resolves(null);

                await handleTrade(req, res);

                expect(res.render.calledOnce).to.be.true;
                const [view, context] = res.render.firstCall.args;
                expect(view).to.equal('trade');
                expect(context.error).to.equal('Stock not found. Please search for the stock first.')

            });
            
            it('Render trade page if account is not found', async () => {
                Account.findAccountByID.resolves(null);

                await handleTrade(req, res);

                expect(res.render.calledOnce).to.be.true;
                const [view, context] = res.render.firstCall.args;
                expect(view).to.equal('trade');
                expect(context.error).to.equal('Account not found')

            })

            it('Render trade page if account is deactivated', async () => {
                Account.findAccountByID.resolves({
                    accountStatus: 0
                });
                
                await handleTrade(req, res);
                expect(res.render.calledOnce).to.be.true;
                const [view, context] = res.render.firstCall.args;
                expect(view).to.equal('trade');
                expect(context.error).to.equal('Trade not possible, account is deactivated');
            });
        });

        describe('trade validation', () => {
            it('Render trade page with error if insufficient funds', async () => {
                await handleTrade(req, res);
        
                expect(res.render.calledOnce).to.be.true;
                const [view, context] = res.render.firstCall.args;
                expect(view).to.equal('trade');
                expect(context.error).to.equal('Insufficient funds');
            });        
            
            it('Return error message if not enough stocks in holdings', async () => {
                req.body.tradeType = 'sell';
                Trade.checkHoldings.resolves(false);

                await handleTrade(req, res);

                expect(res.status.calledWith(400)).to.be.true;
                expect(res.status().send.calledWith("Insufficient holdings to sell.")).to.be.true;
            });
        });

        describe('error handling', () => {
            it('Catch block, unforeseen error', async () => {
                Trade.checkFunds.resolves(true);
                Trade.createTrade = sinon.stub().throws(new Error("Database failure"));

                await handleTrade(req, res);

                expect(res.render.calledOnce).to.be.true;
                const [view, context] = res.render.firstCall.args;
                expect(view).to.equal('trade');
                expect(context.error).to.equal('Trade could not be processed. Please try again.');
            });
        });
});






/*const { expect } = require ('chai'); //imports expect from Chai - used to write whats expected 
const sinon = require ('sinon'); //import sinon - used to make fake functions 
const { handleTrade } = require ('../controllers/tradeController.js'); //import wanted to test trade function 
const { Trade } = require ('../models/tradeModels.js'); 
const { Stocks } = require ('../models/stockModels.js');
const { Account } = require ('../models/accountModels.js');
const  fetchExchangeRate  = require ('../services/fetchExchangeRate.js');
const { Transaction } = require ('../models/transactionModels.js')

//Unittest for handleTrade function
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
                redirect: sinon.stub(), //checks if redirect gets used correctly
                send: sinon.stub()
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
            sinon.stub(Trade, 'checkHoldings').resolves(false);
            });

        //cleans after each test and removes all fakes (stubs)
        afterEach(() => {
            sinon.restore();
        });
        it ('Return 401 if user is not logged in', async () => {
            req.session.userID = null;
            await handleTrade(req, res);

            expect(res.status.calledWith(401)).to.be.true;
            expect(res.status().send.calledWith("Unauthorized")).to.be.true;
        });

        it ('Render trade page if there are empty input fields', async () => {
            req.body.Ticker = null;
            await handleTrade(req, res);

            expect(res.render.calledOnce).to.be.true;
            const [view, context] = res.render.firstCall.args;
            expect(view).to.equal('trade');
            expect(context.error).to.equal('All fields are required')

        })

        it('Return error if stock is not found in database', async () => {
            Stocks.findStockByTicker.resolves(null);

            await handleTrade(req, res);

            expect(res.render.calledOnce).to.be.true;
            const [view, context] = res.render.firstCall.args;
            expect(view).to.equal('trade');
            expect(context.error).to.equal('Stock not found. Please search for the stock first.')

        });
        
        it('Render trade page if account is not found', async () => {
            Account.findAccountByID.resolves(null);

            await handleTrade(req, res);

            expect(res.render.calledOnce).to.be.true;
            const [view, context] = res.render.firstCall.args;
            expect(view).to.equal('trade');
            expect(context.error).to.equal('Account not found')

        })

        it('Render trade page if account is deactivated', async () => {
            Account.findAccountByID.resolves({
                accountStatus: 0
            });
            
            await handleTrade(req, res);
            expect(res.render.calledOnce).to.be.true;
            const [view, context] = res.render.firstCall.args;
            expect(view).to.equal('trade');
            expect(context.error).to.equal('Trade not possible, account is deactivated');
        });

        it('Render trade page with error if insufficient funds', async () => {
            await handleTrade(req, res);
    
            expect(res.render.calledOnce).to.be.true;
            const [view, context] = res.render.firstCall.args;
            expect(view).to.equal('trade');
            expect(context.error).to.equal('Insufficient funds');
        });        
        
        it('Return error message if not enough stocks in holdings', async () => {
            req.body.tradeType = 'sell';
            Trade.checkHoldings.resolves(false);

            await handleTrade(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.status().send.calledWith("Insufficient holdings to sell.")).to.be.true;
        });

        it('Catch block, unforeseen error', async () => {
            Trade.checkFunds.resolves(true);
            Trade.createTrade = sinon.stub().throws(new Error("Database failure"));

            await handleTrade(req, res);

            expect(res.render.calledOnce).to.be.true;
            const [view, context] = res.render.firstCall.args;
            expect(view).to.equal('trade');
            expect(context.error).to.equal('Trade could not be processed. Please try again.');
        });
});
*/