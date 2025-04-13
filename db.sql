CREATE TABLE Users (
  userID INT PRIMARY KEY IDENTITY(1,1),
  name NVARCHAR(100) NOT NULL,
  username NVARCHAR(100),
  email NVARCHAR(100),
  password NVARCHAR(100),
  age INT NOT NULL
);

CREATE TABLE Banks (
bankID INT PRIMARY KEY IDENTITY(1,1),
bankName NVARCHAR (100) NOT NULL
);

CREATE TABLE Accounts (
  accountID INT PRIMARY KEY IDENTITY(1,1),
  userID INT NOT NULL,
  currency VARCHAR(50),
  balance DECIMAL(18,2),
  registrationDate DATETIME,
  accountStatus BIT,
  bankID INT,

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