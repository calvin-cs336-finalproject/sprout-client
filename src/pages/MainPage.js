import React, { useState, useEffect } from "react";
import { Container, Grid2, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { getAllStockData, getUserData, updateUserBalance, updateUserPortfolio, getUserPortfolio, addToWishlist, getWishlist, deleteFromWishlist } from "../services/firestoreService.js";
import { auth } from "../firebase.js";
import { onAuthStateChanged } from "firebase/auth";

import SelectedStock from "../components/SelectedStock.js";
import Portfolio from "../components/Portfolio.js";
import Stocks from "../components/Stocks.js";
import Leaderboard from "../components/Leaderboard.js";
import Wishlist from "../components/Wishlist.js";

function MainPage() {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [userBalance, setUserBalance] = useState(10000); // Default balance
  const [wishlist, setWishlist] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStocks() {
      try {
        const fetchedStocks = await getAllStockData('stocks');
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
          setUserBalance(userData.balance);

          const profile = await getUserPortfolio(currentUser.uid);
          setPortfolio(profile);

          const watchlist = await getWishlist(currentUser.uid);
          setWishlist(watchlist);

        } catch (error) {
          console.error("Error fetching user data or profile:", error);
        }
      } else {
        navigate("/auth");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleBuyStock = async () => {
    if (!selectedStock) return;
  
    const latestPrice = selectedStock.Prices[selectedStock.Prices.length - 1];
    const price = latestPrice ? Object.values(latestPrice)[0] : 0;
  
    if (userBalance >= price) {
      const newBalance = userBalance - price;
      setUserBalance(newBalance);
      updateUserBalance(user.uid, newBalance);
  
      setPortfolio((prev) => {
        const existingStock = prev.find((item) => item.Ticker === selectedStock.Ticker);
        let updatedPortfolio;
  
        if (existingStock) {
          updatedPortfolio = prev.map((item) =>
            item.Ticker === selectedStock.Ticker
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  totalInvested: item.totalInvested + price,
                  averagePrice:
                    (item.totalInvested + price) / (item.quantity + 1),
                }
              : item
          );
        } else {
          updatedPortfolio = [
            ...prev,
            {
              ...selectedStock,
              quantity: 1,
              totalInvested: price,
              averagePrice: price,
            },
          ];
        }
  
        // Update Firestore portfolio with required fields
        const updatedStock = updatedPortfolio.find(
          (item) => item.Ticker === selectedStock.Ticker
        );
        if (updatedStock) {
          const currentPrice = price;
          const percentChange = calculatePercentageChange(currentPrice, updatedStock.averagePrice);
          updateUserPortfolio(user.uid, {
            ...updatedStock,
            currentPrice,
            percentChange,
          }, "buy");
        }
        return updatedPortfolio;
      });
    } else {
      alert("Not enough balance to buy this stock!");
    }
  };
  
  const handleSellStock = async (stockToSell) => {
    const currentStock = stocks.find((s) => s.Ticker === stockToSell.Ticker);
    if (!currentStock) return;
  
    if (stockToSell.quantity > 0) {
      const currentPrice = Object.values(currentStock.Prices[currentStock.Prices.length - 1])[0];
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
        const updatedStock = updatedPortfolio.find(
          (item) => item.Ticker === stockToSell.Ticker
        ) || null;
  
        const percentChange = calculatePercentageChange(
          currentPrice,
          stockToSell.averagePrice
        );
        updateUserPortfolio(user.uid, {
          ...stockToSell,
          currentPrice,
          percentChange,
          quantity: updatedStock ? updatedStock.quantity : 0,
        }, "sell");
  
        return updatedPortfolio;
      });
    } else {
      alert("You don't own enough of this stock to sell!");
    }
  };  

  const handleAddToWishlist = async (stock) => {
    try {
      // Check if the stock is already in the wishlist
      const stockExists = wishlist.some((item) => item.Ticker === stock.Ticker);
  
      if (stockExists) {
        console.log(`${stock.Ticker} is already in the wishlist`);
        return; // If the stock is already in the wishlist, return early
      }
  
      // Call the addToWishlist function from firestoreService to add the stock to the wishlist
      await addToWishlist(user.uid, stock);
  
      // Update the wishlist state by adding the newly added stock
      setWishlist((prevWishlist) => [...prevWishlist, stock]);
  
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
  
      // Update the wishlist state by filtering out the removed stock
      setWishlist((prevWishlist) =>
        prevWishlist.filter((stock) => stock.Ticker !== stockTicker)
      );
      console.log(`Stock ${stockTicker} removed from wishlist.`);
    } catch (error) {
      console.error("Error removing stock from wishlist:", error);
    }
  };

   const calculatePercentageChange = (currentPrice, purchasePrice) => {
     return ((currentPrice - purchasePrice) / purchasePrice) * 100;
   };

   const calculateOverallPerformance = () => {
    const totalInvested = portfolio.reduce((sum, stock) => sum + stock.totalInvested, 0);
    const currentValue = portfolio.reduce((sum, stock) => {
      const currentStock = stocks.find((s) => s.Ticker === stock.Ticker);
      const currentPrice = currentStock?.Prices?.at(-1)?.[0] || 0;
      return sum + currentPrice * stock.quantity;
    }, 0);
  
    return totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;
  };
  
  const overallPerformance = calculateOverallPerformance();

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <Container maxWidth="lg" style={{ marginTop: "2rem" }}>
    <Grid2 container spacing={2}>
      {/* First row: Dashbaord */}
      <Grid2 item xs={12}>
        <Typography variant="h4" color="#28a745" align="center" gutterBottom>
          Sprout
        </Typography>
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
  
      {/* Second row: Stocks and SelectedStock */}
      <Grid2 item xs={6}>
        <Stocks
          stocks={stocks}
          setSelectedStock={setSelectedStock}
          selectedStock={selectedStock}
        />
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
    </Grid2>
  </Container>
  
  );
}

export default MainPage;
