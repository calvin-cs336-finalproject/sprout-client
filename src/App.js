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
  const [searchTerm, setSearchTerm] = useState(''); // Added state for search
  const [userBalance, setUserBalance] = useState(10000); // Default balance
  const [portfolio, setPortfolio] = useState([]);

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
          const latestPrice = stock.Prices[stock.Prices.length - 1];
          if (latestPrice) {
            // Get the most recent price and modify it
            const latestPriceValue = Object.values(latestPrice)[0];
            const newPrice = Math.max(1, latestPriceValue + (Math.random() - 0.5) * 10);
            return { ...stock, price: newPrice.toFixed(2) }; // Update stock price
          }
          return stock;
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleBuyStock = () => {
    if (!selectedStock) return;
    const latestPrice = selectedStock.Prices[selectedStock.Prices.length - 1];
    const price = latestPrice ? Object.values(latestPrice)[0] : 0;
    if (userBalance >= price) {
      setUserBalance((prevBalance) => prevBalance - price);
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

      setUserBalance((prevBalance) => prevBalance + currentPrice);
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
            onChange={(e) => setSearchTerm(e.target.value)} // Handle search input change
            margin="normal"
          />
          <List>
            {stocks
              .filter((stock) =>
                stock.Ticker?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((stock, index) => {
                const latestPriceObj = stock.Prices[stock.Prices.length - 1];
                const latestPriceValue = latestPriceObj
                  ? Object.values(latestPriceObj)[0]
                  : 'N/A';
                return (
                  <ListItem
                    key={index}
                    button
                    onClick={() => setSelectedStock(stock)}
                    selected={selectedStock?.Ticker === stock.Ticker}
                    style={{
                      border: "1px solid #ddd",
                      marginBottom: "0.5rem",
                      borderRadius: "5px",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1">{stock.Ticker}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Price: ${latestPriceValue !== 'N/A' ? parseFloat(latestPriceValue).toFixed(2) : 'N/A'}
                      </Typography>
                    </Box>
                  </ListItem>
                );
              })}
          </List>
        </Grid>
        <Grid item xs={12} md={6.2}>
          <Typography variant="h5" gutterBottom>
            Selected Stock
          </Typography>
          {selectedStock ? (
            <Card>
              <CardContent>
                <Typography variant="h6">{selectedStock.Ticker}</Typography>
                <Typography variant="body1">
                  Price: ${parseFloat(Object.values(selectedStock.Prices[selectedStock.Prices.length - 1])[0]).toFixed(2)}
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
              <div>
                <h1>Stock Price Graph</h1>
                <GraphContainer ticker={selectedStock.Ticker} />
              </div>
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
              const currentStock = stocks.find((s) => s.Ticker === stock.Ticker);
              const currentPrice = currentStock ? Object.values(currentStock.Prices[currentStock.Prices.length - 1])[0] : 0;
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
                      {stock.Ticker} - {stock.quantity} shares
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Current Price: ${parseFloat(currentPrice).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Change:{" "}
                      {calculatePercentageChange(currentPrice, stock.averagePrice).toFixed(2)}%
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
    </Container>
  );
}

export default App;
