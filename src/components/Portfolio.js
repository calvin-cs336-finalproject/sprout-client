// Imports from react
import React from "react";

// Imports from material ui
import { Grid2, List, ListItem } from "@mui/material";

// Our Portfolio component
function Portfolio({
  stocks,
  portfolio,
  handleSelectStock,
  selectedStock,
  calculateStockPerformance,
}) {
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
          const performance = calculateStockPerformance(currentStock);
          return (
            <ListItem
              key={index}
              style={{
                border: "0px",
                borderRadius: "8px",
                cursor: "pointer",
                marginBottom: "0px",
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
                    ${parseFloat(currentPrice).toFixed(2)} (
                    {portfolio.find((s) => s.Ticker === stock.Ticker).quantity})
                  </div>
                </div>
                <div className="portfolio-stock-bottom">
                  <h4 className="shortened-name">{currentStock.Name}</h4>
                  <div
                    className="daily-change"
                    style={
                      performance < 0
                        ? {
                            backgroundColor: "#ec3936",
                          }
                        : {
                            backgroundColor: "#14ae5c",
                          }
                    }
                  >
                    {performance}%
                  </div>
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
