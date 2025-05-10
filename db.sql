CREATE TABLE Users (
  userID INT PRIMARY KEY IDENTITY(1,1),
  name NVARCHAR(100) NOT NULL,
  username NVARCHAR(100) NOT NULL,
  email NVARCHAR(100) NOT NULL,
  password NVARCHAR(100) NOT NULL
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
  deactivationDate DATETIME NULL,

  FOREIGN KEY (userID) REFERENCES Users(userID),
  FOREIGN KEY (bankID) REFERENCES Banks(bankID)
);


CREATE TABLE Portfolios (
  portfolioID INT PRIMARY KEY IDENTITY(1,1),
  accountID INT NOT NULL,
  portfolioName NVARCHAR(100) NOT NULL,
  registrationDate DATETIME NOT NULL,

  FOREIGN KEY (accountID) REFERENCES Accounts(accountID)
);

CREATE TABLE Stocks (
    stockID INT IDENTITY(1,1) PRIMARY KEY,
    ticker NVARCHAR(20) NOT NULL,
    latestDate DATE NOT NULL,
    closePrice DECIMAL(10,2) NOT NULL,
    portfolioID INT,
    stockCurrency NVARCHAR(100),
    stockName NVARCHAR(100) NOT NULL,
    stockType NVARCHAR(100)NOT NULL;

    FOREIGN KEY (portfolioID) REFERENCES Portfolios(portfolioID)
);


CREATE TABLE Pricehistory (
  historyID INT PRIMARY KEY IDENTITY(1,1),
  stockID INT NOT NULL,
  price DECIMAL (18,4) NOT NULL,
  priceDate DATETIME2 NOT NULL,
  dailyChange DECIMAL (18,4),
  yearlyChange DECIMAL (18,4),

  FOREIGN KEY (stockID) REFERENCES [dbo].[Stocks](stockID)
);

CREATE TABLE Trades (
    tradeID INT IDENTITY(1,1) PRIMARY KEY,
    portfolioID INT NOT NULL,
    stockID INT NOT NULL,
    tradeType VARCHAR(4) CHECK (tradeType IN ('buy', 'sell')) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(18,4) NOT NULL,
    fee DECIMAL(18,4) NOT NULL,
    totalPrice DECIMAL(18,4) NOT NULL,
    tradeDate DATETIME NOT NULL,
    accountID INT NOT NULL,
    ticker NVARCHAR(10) NOT NULL

    FOREIGN KEY (portfolioID) REFERENCES Portfolios(portfolioID),
    FOREIGN KEY (stockID) REFERENCES Stocks(stockID),
    FOREIGN KEY (accountID) REFERENCES Accounts(accountID)
);


CREATE TABLE Transactions (
    transactionID INT PRIMARY KEY,
    tradeID INT,
    accountID INT NOT NULL,
    amount DECIMAL(18,4) NOT NULL,
    transactionDate DATETIME NOT NULL,

    FOREIGN KEY (tradeID) REFERENCES Trades(tradeID),
    FOREIGN KEY (accountID) REFERENCES Accounts(accountID)
);

CREATE TABLE ExchangeRates (
    exchangeRateID INT IDENTITY(1, 1) PRIMARY KEY,
    ticker VARCHAR(255),
    fromCurrency VARCHAR(255),
    toCurrency VARCHAR(255),
    rate FLOAT,
);
