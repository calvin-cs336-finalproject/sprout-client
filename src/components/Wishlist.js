import React from "react";
import { Grid2, Typography, Box, Button } from "@mui/material";

function Wishlist({ stocks, wishlist, handleRemoveFromWishlist }) {

  return (
    <Grid2 item xs={12} md={4}>
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
            flexWrap: "nowrap",  // Prevent items from wrapping to the next row
            gap: "1rem",
            justifyContent: "flex-start",
            overflowX: "auto",    // Enable horizontal scrolling
            maxWidth: "900px",     // Allow scrolling within the parent container
          }}
        >
          {wishlist.map((stock, index) => {
            const currentStock = stocks.find((s) => s.Ticker === stock.Ticker);
            const currentPrice = currentStock
              ? Object.values(currentStock.Prices[currentStock.Prices.length - 1])[0]
              : 0;
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
                  {stock.Ticker} - ${currentPrice?.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Change: {stock.percentChange?.toFixed(2)}%
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleRemoveFromWishlist(stock.Ticker)}
                  style={{ marginTop: "0.5rem" }}
                >
                  Remove
                </Button>
              </Box>
            );
          })}
        </Box>
      )}
    </Grid2>
  );
}

export default Wishlist;
