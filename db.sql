CREATE TABLE Users (
  userID INT PRIMARY KEY IDENTITY(1,1),
  name NVARCHAR(100) NOT NULL,
  username NVARCHAR(100) NOT NULL,
  email NVARCHAR(100) NOT NULL,
  password NVARCHAR(100) NOT NULL,
  age INT NOT NULL
);

CREATE TABLE Banks (
bankID INT PRIMARY KEY IDENTITY(1,1),
bankName NVARCHAR (100) NOT NULL
);

CREATE TABLE Accounts (
  accountID INT PRIMARY KEY IDENTITY(1,1),
  userID INT NOT NULL,
  accountName NVARCHAR(100) NOT NULL,
  currency VARCHAR(50) NOT NULL,
  balance DECIMAL(18,2) NOT NULL,
  registrationDate DATETIME NOT NULL,
  accountStatus BIT NOT NULL,
  bankID INT NOT NULL,

  FOREIGN KEY (userID) REFERENCES Users(userID),
  FOREIGN KEY (bankID) REFERENCES Banks(bankID)
);

ALTER TABLE Accounts
ADD deactivationDate DATETIME NULL;

CREATE TABLE Portfolios (
  portfolioID INT PRIMARY KEY IDENTITY(1,1),
  accountID INT NOT NULL,
  portfolioName NVARCHAR(100) NOT NULL,
  registrationDate DATETIME NOT NULL,

  FOREIGN KEY (accountID) REFERENCES Accounts(accountID)
);

CREATE TABLE Stocks (
    StockID INT IDENTITY(1,1) PRIMARY KEY,
    Ticker NVARCHAR(20) NOT NULL,
    latestDate DATE NOT NULL,
    ClosePrice DECIMAL(10,2) NOT NULL,
    portfolioID INT,
    stockCurrency NVARCHAR(100) NOT NULL,
    stockName NVARCHAR(100) NOT NULL,
    stockType NVARCHAR(100)NOT NULL;
    FOREIGN KEY (portfolioID) REFERENCES Portfolios(portfolioID)
);



CREATE TABLE Pricehistory (
  historyID INT PRIMARY KEY IDENTITY(1,1),
  stockID INT NOT NULL,
  price DECIMAL (18,4) NOT NULL,
  priceDate DATETIME2 NOT NULL,
  FOREIGN KEY (stockID) REFERENCES [dbo].[Stocks](stockID)
);

CREATE TABLE Trades (
    tradeID INT PRIMARY KEY,
    portfolioID INT NOT NULL,
    stockID INT NOT NULL,
    tradeType VARCHAR(4) CHECK (tradeType IN ('buy', 'sell')) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(18,4) NOT NULL,
    fee DECIMAL(18,4) NOT NULL,
    totalPrice DECIMAL(18,4) NOT NULL,
    date DATETIME NOT NULL,
    accountID INT NOT NULL,

    FOREIGN KEY (portfolioID) REFERENCES Portfolios(portfolioID),
    FOREIGN KEY (stockID) REFERENCES Stocks(stockID),
    FOREIGN KEY (accountID) REFERENCES Accounts(accountID)
);
-- We had issues with our original Trades SQL code, so here we have made some changes so it is more functional 
-- We forgot to give tradeID an IDENTITY property, so we had to drop key contraints, remove the column and readd it with the right properties
-- 1. Drop foreign key constraints first
ALTER TABLE Transactions
DROP CONSTRAINT FK__Transacti__trade__29221CFB;

-- 2. Drop primary key constraint on Trades
ALTER TABLE Trades
DROP CONSTRAINT PK__Trades__F7D149FD2A7F9344;

-- 3. Drop tradeID column
ALTER TABLE Trades
DROP COLUMN tradeID;

-- 4. Add tradeID again with IDENTITY and PRIMARY KEY
ALTER TABLE Trades
ADD tradeID INT IDENTITY(1,1) PRIMARY KEY;



ALTER TABLE Trades
ADD accountID INT NOT NULL;
-- Add a foreign key constraint to link accountID to the Accounts table
ALTER TABLE Trades

ADD CONSTRAINT FK_Trades_Accounts FOREIGN KEY (accountID) REFERENCES Accounts(accountID);
CREATE TABLE Transactions (
    transactionID INT PRIMARY KEY,
    tradeID INT NOT NULL,
    accountID INT NOT NULL,
    amount DECIMAL(18,4) NOT NULL,
    date DATETIME NOT NULL,

    FOREIGN KEY (tradeID) REFERENCES Trades(tradeID),
    FOREIGN KEY (accountID) REFERENCES Accounts(accountID)
);

CREATE TABLE ExchangeRates (
    ExchangeRateID INT PRIMARY KEY,
    Ticker NVARCHAR,
    FromCurrency FLOAT,
    ToCurrency FLOAT,
    Rate FLOAT,
);