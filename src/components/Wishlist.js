import React from "react";
import { Typography, Box, Button } from "@mui/material";

function Wishlist({
  stocks,
  wishlist,
  handleRemoveFromWishlist,
  handleSelectStock,
  selectedStock,
}) {
  return (
    <div className="watchlist-container">
      <Typography variant="h5" gutterBottom>
        Watchlist
      </Typography>
      {/* Check if wishlist is empty */}
      {wishlist.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          Your watchlist is empty.
        </Typography>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexWrap: "nowrap", // Prevent items from wrapping to the next row
            gap: "0rem",
            justifyContent: "flex-start",
            overflowX: "auto", // Enable horizontal scrolling
          }}
        >
          {wishlist.map((ticker, index) => {
            // Find the full stock object based on ticker
            const currentStock = stocks.find((s) => s.Ticker === ticker);
            if (!currentStock) return null; // If stock not found, skip rendering

            // Get the latest price from the stock object
            const currentPrice =
              currentStock.Prices.length > 0
                ? Object.values(
                    currentStock.Prices[currentStock.Prices.length - 1]
                  )[0]
                : 0;

            // Get the percent change based on the stock object
            const percentChange = currentStock.percentChange || 0;

            return (
              <Box
                key={index}
                sx={{
                  padding: "8px",
                  borderRadius: "8px",

                  width: "186px", // Control the width of each item
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  backgroundColor:
                    selectedStock && selectedStock.Ticker === ticker
                      ? "#f5f7f9"
                      : "white",
                  flexShrink: 0, // Prevent the items from shrinking
                }}
                onClick={() => handleSelectStock(currentStock)}
              >
                <div className="watch-stock-top">
                  {currentStock && (
                    <img
                      className="watch-img"
                      src={currentStock.Image}
                      alt={currentStock.Name}
                    />
                  )}
                  <div className="watch-stock-names">
                    <h1>{currentStock.Ticker}</h1>
                    <h4 className="watch-short-name">{currentStock.Name}</h4>
                  </div>
                </div>
                <div className="watch-stock-bottom">
                  <div className="stock-price">${currentPrice.toFixed(2)}</div>
                  <div className="daily-change">-0.45</div>
                </div>
                {/* <Typography variant="subtitle1">
                  {ticker} - ${currentPrice.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Change: {percentChange.toFixed(2)}%
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleRemoveFromWishlist(ticker)}
                  style={{ marginTop: "0.5rem" }}
                >
                  Remove
                </Button>
                {currentStock && (
                  <img
                    className="stock-img"
                    src={currentStock.Image}
                    alt={currentStock.Name}
                  />
                )} */}
              </Box>
            );
          })}
        </Box>
      )}
    </div>
  );
}

export default Wishlist;
