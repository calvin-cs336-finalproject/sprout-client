import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import GraphContainer from "./components/GraphContainer.js";
import { getAllStockData } from "./services/firestoreService.js";

function App() {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [userBalance, setUserBalance] = useState(10000); // Default balance
  const [portfolio, setPortfolio] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Simulate stock price changes every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((prevStocks) =>
        prevStocks.map((stock) => {
          const newPrice = Math.max(1, stock.price + (Math.random() - 0.5) * 10);
          return { ...stock, price: newPrice.toFixed(2) }; // Update stock price
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Update the selected stock dynamically when prices change
  useEffect(() => {
    if (selectedStock) {
      const updatedStock = stocks.find(
        (stock) => stock.name === selectedStock.name
      );
      if (updatedStock) setSelectedStock(updatedStock);
    }
  }, [stocks]);

  const handleBuyStock = () => {
    if (!selectedStock) return;
    if (userBalance >= selectedStock.price) {
      setUserBalance((prevBalance) => prevBalance - selectedStock.price);
      setPortfolio((prev) => {
        const existingStock = prev.find((item) => item.name === selectedStock.name);
        if (existingStock) {
          return prev.map((item) =>
            item.name === selectedStock.name
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  totalInvested: item.totalInvested + selectedStock.price,
                  averagePrice:
                    (item.totalInvested + selectedStock.price) /
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
            totalInvested: selectedStock.price,
            averagePrice: selectedStock.price,
          },
        ];
      });
    } else {
      alert("Not enough balance to buy this stock!");
    }
  };

  const handleSellStock = (stockToSell) => {
    const currentStock = stocks.find((s) => s.name === stockToSell.name);
    if (!currentStock) return;

    if (stockToSell.quantity > 0) {
      const currentPrice = currentStock.price;

      setUserBalance((prevBalance) => prevBalance + currentPrice);
      setPortfolio((prev) =>
        prev
          .map((item) =>
            item.name === stockToSell.name
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

  const calculatePercentageChange = (currentPrice, purchasePrice) => {
    return ((currentPrice - purchasePrice) / purchasePrice) * 100;
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: "2rem" }}>
      <Typography variant="h4" color="#28a745" align="center" gutterBottom>
        Sprout
      </Typography>
      <Typography variant="h6" align="center">
        Balance: ${userBalance.toFixed(2)}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Typography variant="h5" gutterBottom>
            Stocks
          </Typography>
          <TextField
            fullWidth
            label="Search Stocks"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            margin="normal"
          />
          <List>
            {stocks
              .filter((stock) =>
                stock.name?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((stock, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => setSelectedStock(stock)}
                  selected={selectedStock?.name === stock.name}
                  style={{
                    border: "1px solid #ddd",
                    marginBottom: "0.5rem",
                    borderRadius: "5px",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">{stock.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Price: ${parseFloat(stock.price).toFixed(2)}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
          </List>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h5" gutterBottom>
            Selected Stock
          </Typography>
          {selectedStock ? (
            <Card>
              <CardContent>
                <Typography variant="h6">{selectedStock.name}</Typography>
                <Typography variant="body1">
                  Current Price: ${parseFloat(selectedStock.price).toFixed(2)}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  style={{ marginTop: "1rem" }}
                  onClick={handleBuyStock}
                >
                  Buy Stock
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Typography variant="body1" color="textSecondary">
              Select a stock to view details.
            </Typography>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h5" gutterBottom>
            Portfolio
          </Typography>
          <List>
            {portfolio.map((stock, index) => {
              const currentStock = stocks.find((s) => s.name === stock.name);
              return (
                <ListItem
                  key={index}
                  style={{
                    border: "1px solid #ddd",
                    marginBottom: "0.5rem",
                    borderRadius: "5px",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">
                      {stock.name} - {stock.quantity} shares
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Current Price: ${parseFloat(currentStock?.price || stock.price).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Change:{" "}
                      {calculatePercentageChange(
                        parseFloat(currentStock?.price || stock.price),
                        stock.averagePrice
                      ).toFixed(2)}
                      %
                    </Typography>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => handleSellStock(stock)}
                      style={{ marginTop: "0.5rem" }}
                    >
                      Sell
                    </Button>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        </Grid>
      </Grid>
      <div>
        <h1>Stock Price Graph</h1>
        <GraphContainer ticker="AAPL" />
      </div>
    </Container>
  );
}

export default App;
