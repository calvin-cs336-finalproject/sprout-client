import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import {
  getAllStockData,
  getUserData,
  updateUserBalance,
  updateUserPortfolio,
  getUserPortfolio,
  addToWishlist,
  getWishlist,
  deleteFromWishlist,
} from "../services/firestoreService.js";
import { auth } from "../firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";

import SelectedStock from "../components/SelectedStock.js";
import Portfolio from "../components/Portfolio.js";
import Stocks from "../components/Stocks.js";
import Leaderboard from "../components/Leaderboard.js";
import Wishlist from "../components/Wishlist.js";
import ProfileDropdown from "../components/Profile.js";

function MainPage() {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [userBalance, setUserBalance] = useState(10000); // Default balance
  const [username, setUsername] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStocks() {
      try {
        const fetchedStocks = await getAllStockData("stocks");
        setStocks(fetchedStocks);
      } catch (error) {
        console.error("Error loading stocks:", error);
      }
    }
    fetchStocks();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userData = await getUserData(currentUser.uid);
          console.log("User Data:", userData);
          setUserBalance(userData.balance);
          setUsername(userData.username);

          const profile = await getUserPortfolio(currentUser.uid);
          setPortfolio(profile);

          const watchlist = await getWishlist(currentUser.uid);
          setWishlist(watchlist);
        } catch (error) {
          console.error("Error fetching user data or profile:", error);
        }
      } else {
        setUser(null);
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleBuyStock = async (currentStock) => {
    if (
      !currentStock ||
      !currentStock.Prices ||
      currentStock.Prices.length === 0
    ) {
      console.error(
        "Invalid stock data or missing prices for the stock:",
        currentStock
      );
      return; // Return early if stock data or prices are invalid
    }

    // Get the latest price for the selected stock
    const latestPrice = currentStock.Prices[currentStock.Prices.length - 1]; // Safe access
    const price = latestPrice ? Object.values(latestPrice)[0] : 0;

    // Check if the user has enough balance to buy the stock
    if (userBalance >= price) {
      const newBalance = userBalance - price;
      setUserBalance(newBalance);
      updateUserBalance(user.uid, newBalance);

      setPortfolio((prev) => {
        // Check if the stock already exists in the portfolio
        const stockIndex = prev.findIndex(
          (item) => item.Ticker === currentStock.Ticker
        );

        if (currentStock.Ticker === wishlist.find((s) => s === currentStock.Ticker)) {
          handleRemoveFromWishlist(currentStock.Ticker);
        }

        let updatedPortfolio;

        if (stockIndex !== -1) {
          // If the stock exists, update the stock
          updatedPortfolio = prev.map((item, index) =>
            index === stockIndex
              ? {
                  ...item,
                  quantity: item.quantity + 1, // Increase quantity by 1
                  totalInvested: item.totalInvested + price, // Update total invested
                  averagePrice:
                    (item.totalInvested + price) / (item.quantity + 1), // Update average price
                }
              : item
          );
        } else {
          // If the stock does not exist, add it to the portfolio
          updatedPortfolio = [
            ...prev,
            {
              Ticker: currentStock.Ticker,
              quantity: 1, // New stock, so quantity starts at 1
              totalInvested: price, // Total invested is the price of the stock
              averagePrice: price, // Average price is the price of the stock
            },
          ];
        }

        // Update Firestore portfolio with required fields
        const updatedStock = updatedPortfolio.find(
          (item) => item.Ticker === currentStock.Ticker
        );
        if (updatedStock) {
          const currentPrice = price;
          const percentChange = calculatePercentageChange(
            currentPrice,
            updatedStock.averagePrice
          );
          updateUserPortfolio(
            user.uid,
            {
              ...updatedStock,
              currentPrice,
              percentChange,
            },
            "buy"
          );
        }

        return updatedPortfolio;
      });
    } else {
      alert("Not enough balance to buy this stock!");
    }
  };

  const handleSellStock = async (stockToSell) => {
    const currentStock = stocks.find((s) => s.Ticker === stockToSell.Ticker);
    console.log("Current Stock:", stockToSell);
    if (!currentStock) return;

    if (stockToSell.quantity > 0) {
      const currentPrice = Object.values(
        currentStock.Prices[currentStock.Prices.length - 1]
      )[0];
      const newBalance = userBalance + currentPrice;
      setUserBalance(newBalance);
      updateUserBalance(user.uid, newBalance);

      setPortfolio((prev) => {
        const updatedPortfolio = prev
          .map((item) =>
            item.Ticker === stockToSell.Ticker
              ? {
                  ...item,
                  quantity: item.quantity - 1,
                  totalInvested: item.totalInvested - item.averagePrice,
                }
              : item
          )
          .filter((item) => item.quantity > 0); // Remove stock if quantity is 0

        // Update Firestore portfolio with required fields
        const updatedStock =
          updatedPortfolio.find((item) => item.Ticker === stockToSell.Ticker) ||
          null;

        const percentChange = calculatePercentageChange(
          currentPrice,
          stockToSell.averagePrice
        );
        updateUserPortfolio(
          user.uid,
          {
            ...stockToSell,
            currentPrice,
            percentChange,
            quantity: updatedStock ? updatedStock.quantity : 0,
          },
          "sell"
        );

        return updatedPortfolio;
      });
    } else {
      alert("You don't own enough of this stock to sell!");
    }
  };

  const handleAddToWishlist = async (stock) => {
    const isInPortfolio = portfolio.some((s) => s.Ticker === stock.Ticker);
    if (isInPortfolio) {
      console.log("Stock is already in the portfolio and cannot be added to the wishlist.");
      return;
    }

    try {
      // Check if the stock is already in the wishlist
      const stockExists = wishlist.some((item) => item.Ticker === stock.Ticker);

      if (stockExists) {
        console.log(`${stock.Ticker} is already in the wishlist`);
        return; // If the stock is already in the wishlist, return early
      }

      // Call the addToWishlist function from firestoreService to add the stock to the wishlist
      await addToWishlist(user.uid, stock); // Firestore update

      const watchlist = await getWishlist(user.uid);
      setWishlist(watchlist);

      console.log(`${stock.Ticker} added to wishlist`);
    } catch (error) {
      console.error("Error adding stock to wishlist:", error);
    }
  };

  const handleRemoveFromWishlist = async (stockTicker) => {
    try {
      console.log("Removing stock with ticker:", stockTicker); // Add a log to check the value of stockTicker

      // Call the deleteFromWishlist function with the userId and stock ticker
      await deleteFromWishlist(user.uid, stockTicker);

      const watchlist = await getWishlist(user.uid);
      setWishlist(watchlist);

      console.log(`Stock ${stockTicker} removed from wishlist.`);
    } catch (error) {
      console.error("Error removing stock from wishlist:", error);
    }
  };

  const calculatePercentageChange = (currentPrice, purchasePrice) => {
    return ((currentPrice - purchasePrice) / purchasePrice) * 100;
  };

  const calculateOverallPerformance = () => {
    const totalInvested = portfolio.reduce(
      (sum, stock) => sum + stock.totalInvested,
      0
    );
    const currentValue = portfolio.reduce((sum, stock) => {
      const currentStock = stocks.find((s) => s.Ticker === stock.Ticker);
      const currentPrice = currentStock?.Prices?.at(-1)?.[0] || 0;
      return sum + currentPrice * stock.quantity;
    }, 0);

    return totalInvested > 0
      ? ((currentValue - totalInvested) / totalInvested) * 100
      : 0;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error.message);
    }
  };

  const handleSelectStock = (stock) => {
    setSelectedStock(stock);
  };

  const calculateTotalBalance = () => {
    const currentValue = portfolio.reduce((sum, stock) => {
      const currentStock = stocks.find((s) => s.Ticker === stock.Ticker);
      const currentPrice = currentStock?.Prices?.at(-1)?.[0] || 0;
      return sum + currentPrice * stock.quantity;
    }, 0);

    return userBalance + currentValue;
  };

  const overallPerformance = calculateOverallPerformance();
  const totalBalance = calculateTotalBalance();

  return (
    <div className="container">
      <div className="left-bar">
        <img
          src="/SproutLogo.png"
          alt="Sprout Logo"
          style={{ display: "block", margin: "0 auto", maxWidth: "100px" }}
        />
        <Typography variant="h6" align="center">
          Total Balance: ${totalBalance.toFixed(2)}
        </Typography>
        <Typography variant="h6" align="center">
          {" "}
          <span style={{ color: overallPerformance >= 0 ? "green" : "red" }}>
            {overallPerformance.toFixed(2)}%
          </span>
        </Typography>
        <Portfolio
          stocks={stocks}
          portfolio={portfolio}
          handleBuyStock={handleBuyStock}
          handleSellStock={handleSellStock}
          handleSelectStock={handleSelectStock}
          selectedStock={selectedStock}
        />
        <Leaderboard />
      </div>
      <div className="right-container">
        <div className="top-bar">
          <Stocks
            stocks={stocks}
            setSelectedStock={setSelectedStock}
            selectedStock={selectedStock}
          />
          <ProfileDropdown username={username} handleLogout={handleLogout} />
        </div>
        <SelectedStock
          selectedStock={selectedStock}
          handleBuyStock={handleBuyStock}
          handleAddToWishlist={handleAddToWishlist}
        />

        <Wishlist
          wishlist={wishlist}
          handleRemoveFromWishlist={handleRemoveFromWishlist}
          handleSelectStock={handleSelectStock}
          stocks={stocks}
          selectedStock={selectedStock}
        />
      </div>

      {/* <Grid2 container spacing={4}>
        <Grid2 item xs={12}>
          <img
            src="/SproutLogo.png"
            alt="Sprout Logo"
            style={{ display: "block", margin: "0 auto", maxWidth: "100px" }}
          />
          <Typography variant="h6" align="center">
            Total Balance: ${userBalance.toFixed(2)}
          </Typography>
          <Typography variant="h6" align="center">
            {" "}
            <span style={{ color: overallPerformance >= 0 ? "green" : "red" }}>
              {overallPerformance.toFixed(2)}%
            </span>
          </Typography>
          <Portfolio
            stocks={stocks}
            portfolio={portfolio}
            handleBuyStock={handleBuyStock}
            handleSellStock={handleSellStock}
          />
          <Leaderboard />
        </Grid2>
        <Grid2 item>
          <Container className="top-bar">
            <Stocks
              stocks={stocks}
              setSelectedStock={setSelectedStock}
              selectedStock={selectedStock}
            />
            <ProfileDropdown username={username} handleLogout={handleLogout} />
          </Container>
          <SelectedStock
            selectedStock={selectedStock}
            handleBuyStock={handleBuyStock}
            handleAddToWishlist={handleAddToWishlist}
          />

          <Wishlist
            wishlist={wishlist}
            handleRemoveFromWishlist={handleRemoveFromWishlist}
            stocks={stocks}
          />
        </Grid2>
      </Grid2> */}
    </div>
  );
}

export default MainPage;
