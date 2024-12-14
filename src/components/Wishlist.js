import React from "react";
import { Typography, Box, Button } from "@mui/material";

function Wishlist({ stocks, wishlist, handleRemoveFromWishlist }) {
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
            gap: "1rem",
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
                  border: "1px solid #ddd",
                  padding: "0.5rem",
                  borderRadius: "5px",
                  width: "150px", // Control the width of each item
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flexShrink: 0, // Prevent the items from shrinking
                }}
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
                  onClick={() => handleRemoveFromWishlist(ticker)}
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
