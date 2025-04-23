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
  stockID INT PRIMARY KEY IDENTITY(1,1),
  portfolioID INT NOT NULL,
  stockName NVARCHAR(100) NOT NULL,
  currentPrice FLOAT NOT NULL,
  stockType NVARCHAR(100) NOT NULL,
  currency FLOAT NOT NULL
  FOREIGN KEY (portfolioID) REFERENCES [dbo].[Portfolios](stockID)
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

    FOREIGN KEY (portfolioID) REFERENCES Portfolios(portfolioID),
    FOREIGN KEY (stockID) REFERENCES Stocks(stockID)
);

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