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
//import Graph from './components/Graph.js';
import GraphContainer from "./components/GraphContainer.js";

const initialStocks = [
  { name: "Stock A", price: 100, symbol: "A" },
  { name: "Stock B", price: 150, symbol: "B" },
  { name: "Stock C", price: 75, symbol: "C" },
  { name: "Stock D", price: 200, symbol: "D" },
];

function App() {
  const [stocks, setStocks] = useState(initialStocks);
  const [selectedStock, setSelectedStock] = useState(null);
  const [userBalance, setUserBalance] = useState(10000); // Default balance
  const [portfolio, setPortfolio] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  //for graph:
  const [chartData, setChartData] = useState([]);

  //for graph:
  useEffect(() => {
    // Fetch data from the API
    async function fetchData() {
      try {
        const response = await fetch(
          `https://api.polygon.io/v1/open-close/AAPL/2023-01-09?adjusted=true&apiKey=YOUR_API_KEY`
        );
        const data = await response.json();

        // Format the response to match the graph's expected data structure
        const formattedData = [
          {
            date: data.from, // Use the `from` field as the date
            close: data.close, // Use the `close` value
          },
        ];

        setChartData(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  // Simulate stock price changes every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((prevStocks) =>
        prevStocks.map((stock) => {
          const newPrice = Math.max(1, stock.price + (Math.random() - 0.5) * 10);
          return { ...stock, price: newPrice }; // Update stock price
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
      setSelectedStock(updatedStock);
    }
  }, [stocks, selectedStock]);

  const handleBuyStock = () => {
    if (!selectedStock) return;
    if (userBalance >= selectedStock.price) {
      setUserBalance(userBalance - selectedStock.price);
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
    const currentStock = stocks.find((s) => s.name === stockToSell.name); // Get the current price
    if (!currentStock) return;

    if (stockToSell.quantity > 0) {
      const currentPrice = currentStock.price;

      setUserBalance(userBalance + currentPrice); // Add the current price to balance
      setPortfolio((prev) =>
        prev
          .map((item) =>
            item.name === stockToSell.name
              ? {
                ...item,
                quantity: item.quantity - 1,
                totalInvested: item.totalInvested - item.averagePrice, // Reduce invested amount
              }
              : item
          )
          .filter((item) => item.quantity > 0) // Remove stocks with zero quantity
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
        {/* Stocks List */}
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
                stock.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                      Price: ${stock.price.toFixed(2)}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
          </List>
        </Grid>

        {/* Selected Stock */}
        <Grid item xs={12} md={4}>
          <Typography variant="h5" gutterBottom>
            Selected Stock
          </Typography>
          {selectedStock ? (
            <Card>
              <CardContent>
                <Typography variant="h6">{selectedStock.name}</Typography>
                <Typography variant="body1">
                  Current Price: ${selectedStock.price.toFixed(2)}
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

        {/* Portfolio */}
        <Grid item xs={12} md={4}>
          <Typography variant="h5" gutterBottom>
            Portfolio
          </Typography>
          <List>
            {portfolio.map((stock, index) => {
              const currentStock = stocks.find((s) => s.name === stock.name); // Get current stock price
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
                      Current Price: ${currentStock?.price.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Change:{" "}
                      {calculatePercentageChange(
                        currentStock?.price || stock.price,
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
