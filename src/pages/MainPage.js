import React, { useState, useEffect } from "react";
import { Container, Grid2, Typography } from "@mui/material";
import { getAllStockData, getUserData, updateUserBalance } from "../services/firestoreService.js";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase.js";
import { onAuthStateChanged } from "firebase/auth";

import SelectedStock from "../components/SelectedStock.js";
import Portfolio from "../components/Portfolio.js";
import Stocks from "../components/Stocks.js";

function MainPage() {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [userBalance, setUserBalance] = useState(10000); // Default balance
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
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        navigate("/auth");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleBuyStock = () => {
    if (!selectedStock) return;
    const latestPrice = selectedStock.Prices[selectedStock.Prices.length - 1];
    const price = latestPrice ? Object.values(latestPrice)[0] : 0;
    if (userBalance >= price) {
      const newBalance = userBalance - price;
      setUserBalance(newBalance);
      updateUserBalance(user.uid, newBalance);
      setPortfolio((prev) => {
        const existingStock = prev.find((item) => item.Ticker === selectedStock.Ticker);
        if (existingStock) {
          return prev.map((item) =>
            item.Ticker === selectedStock.Ticker
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  totalInvested: item.totalInvested + price,
                  averagePrice:
                    (item.totalInvested + price) /
                    (item.quantity + 1),
                }
              : item
          );
        }
        return [
          ...prev,
          {
            ...selectedStock,
            quantity: 1,
            totalInvested: price,
            averagePrice: price,
          },
        ];
      });
    } else {
      alert("Not enough balance to buy this stock!");
    }
  };

  const handleSellStock = (stockToSell) => {
    const currentStock = stocks.find((s) => s.Ticker === stockToSell.Ticker);
    if (!currentStock) return;

    if (stockToSell.quantity > 0) {
      const currentPrice = Object.values(currentStock.Prices[currentStock.Prices.length - 1])[0];
      const newBalance = userBalance + currentPrice;
      setUserBalance(newBalance);
      updateUserBalance(user.uid, newBalance);
      setPortfolio((prev) =>
        prev
          .map((item) =>
            item.Ticker === stockToSell.Ticker
              ? {
                  ...item,
                  quantity: item.quantity - 1,
                  totalInvested: item.totalInvested - item.averagePrice,
                }
              : item
          )
          .filter((item) => item.quantity > 0)
      );
    } else {
      alert("You don't own enough of this stock to sell!");
    }
  };

  // const calculatePercentageChange = (currentPrice, purchasePrice) => {
  //   return ((currentPrice - purchasePrice) / purchasePrice) * 100;
  // };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <Container maxWidth="lg" style={{ marginTop: "2rem" }}>
      <Typography variant="h4" color="#28a745" align="center" gutterBottom>
          Sprout
      </Typography>
      <Typography variant="h6" align="center">
        Balance: ${userBalance.toFixed(2)}
      </Typography>
      
      <Grid2 container spacing={2}>
        <Stocks stocks={stocks} setSelectedStock={setSelectedStock} selectedStock={selectedStock}/>
        <SelectedStock selectedStock={selectedStock} handleBuyStock={handleBuyStock}/>
        <Portfolio stocks={stocks} portfolio={portfolio} handleBuyStock={handleBuyStock} handleSellStock={handleSellStock}/>
      </Grid2>
    </Container>
  );
}

export default MainPage;
