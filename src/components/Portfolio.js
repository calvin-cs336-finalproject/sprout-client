// Imports from react
import React from "react";

// Imports from material ui
import { Grid2, Typography, List, ListItem, Box, Button } from "@mui/material";

// Our Portfolio component
function Portfolio({ stocks, portfolio, handleBuyStock, handleSellStock, handleSelectStock, selectedStock }) {

  // Return the Portfolio component
  return (
    <Grid2 item xs={12} md={4}>
      <Typography variant="h5" gutterBottom>
        Portfolio
      </Typography>
      <List
        sx={{
          maxHeight: "300px",
          overflowY: "auto", 
        }}
      >
        {/* Display each stock in the portfolio */}
        {portfolio.map((stock, index) => {
          const currentStock = stocks.find((s) => s.Ticker === stock.Ticker);
          const currentPrice = currentStock.Prices.length > 0 ? Object.values(currentStock.Prices[currentStock.Prices.length - 1])[0] : 0;
          return (
            <ListItem
              key={index}
              style={{
                border: "1px solid #ddd",
                marginBottom: "0.5rem",
                borderRadius: "5px",
                cursor: "pointer",
                backgroundColor: selectedStock && selectedStock.Ticker === currentStock.Ticker ? "lightgrey" : "white",
              }}
              onClick={() => handleSelectStock(currentStock)}
            >
              <Box>
                <Typography variant="subtitle1">
                  {stock.Ticker} - {stock.quantity} Share(s)
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Shares: ${parseFloat(currentPrice).toFixed(2)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Change: {stock.percentChange?.toFixed(2)}%
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => {e.stopPropagation(); handleBuyStock(currentStock);}}
                  style={{ marginTop: "0.5rem" }}
                >
                  Buy
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => {e.stopPropagation(); handleSellStock(stock);}}
                  style={{ marginTop: "0.5rem", marginLeft: "0.5rem" }}
                >
                  Sell
                </Button>
              </Box>
            </ListItem>
          );
        })}
      </List>
    </Grid2>
  );
}

export default Portfolio;
