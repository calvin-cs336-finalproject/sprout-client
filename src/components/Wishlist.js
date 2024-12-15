// Imports from react
import React from "react";

// Imports from material ui
import { Typography, Box, Button } from "@mui/material";

// Our Wishlist component
function Wishlist({ stocks, wishlist, handleRemoveFromWishlist, handleSelectStock, selectedStock }) {

  // Return the Wishlist component
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
            flexWrap: "nowrap",
            gap: "1rem",
            justifyContent: "flex-start",
            overflowX: "auto",
          }}
        >
          {/* Loop through the wishlist and display each relevant stock */}
          {wishlist.map((ticker, index) => {
            const currentStock = stocks.find((s) => s.Ticker === ticker);
            if (!currentStock) return null;

            // Get the latest price from the stock object
            const currentPrice =
              currentStock.Prices.length > 0
                ? Object.values(
                    currentStock.Prices[currentStock.Prices.length - 1]
                  )[0]
                : 0;

            // Get the percent change based on the stock object
            const percentChange = currentStock.percentChange || 0;

            // Return the stock item
            return (
              <Box
                key={index}
                sx={{
                  border: "1px solid #ddd",
                  padding: "0.5rem",
                  borderRadius: "5px",
                  width: "150px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  backgroundColor: selectedStock && selectedStock.Ticker === ticker ? "lightgrey" : "white",
                  flexShrink: 0,
                }}
                onClick={() => handleSelectStock(currentStock)}
              >
                <Typography variant="subtitle1">
                  {ticker} - ${currentPrice.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Change: {percentChange.toFixed(2)}%
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => {e.stopPropagation(); handleRemoveFromWishlist(ticker)}}
                  style={{ marginTop: "0.5rem" }}
                >
                  Remove
                </Button>
              </Box>
            );
          })}
        </Box>
      )}
    </div>
  );
}

export default Wishlist;
