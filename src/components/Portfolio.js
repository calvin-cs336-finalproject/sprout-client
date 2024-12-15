// Imports from react
import React from "react";

// Imports from material ui
import { Grid2, List, ListItem } from "@mui/material";

// Our Portfolio component
function Portfolio({ stocks, portfolio, handleSelectStock, selectedStock }) {
  // Return the Portfolio component
  return (
    <Grid2 item xs={12} md={4}>
      <List
        sx={{
          padding: "0px",
          maxHeight: "300px", // Set the maximum height
          overflowY: "auto", // Make it scrollable
        }}
      >
        {/* Display each stock in the portfolio */}
        {portfolio.map((stock, index) => {
          const currentStock = stocks.find((s) => s.Ticker === stock.Ticker);
          const currentPrice = currentStock
            ? Object.values(
                currentStock.Prices[currentStock.Prices.length - 1]
              )[0]
            : 0;
          return (
            <ListItem
              key={index}
              style={{
                border: "0px",
                borderRadius: "8px",
                cursor: "pointer",
                marginBottom: "16px",
                backgroundColor:
                  selectedStock && selectedStock.Ticker === currentStock.Ticker
                    ? "#f5f7f9"
                    : "white",
              }}
              onClick={() => handleSelectStock(currentStock)}
            >
              <div className="portfolio-stock">
                <div className="portfolio-stock-top">
                  <h1>{currentStock.Ticker}</h1>
                  <div className="stock-price">
                    ${parseFloat(currentPrice).toFixed(2)}
                  </div>
                </div>
                <div className="portfolio-stock-bottom">
                  <h4>{currentStock.Name}</h4>
                  <div className="daily-change">-0.45</div>
                </div>
                {/*
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
                </Button> */}
              </div>
            </ListItem>
          );
        })}
      </List>
    </Grid2>
  );
}

export default Portfolio;
