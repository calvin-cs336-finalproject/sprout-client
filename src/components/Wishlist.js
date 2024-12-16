// Imports from react
import React from "react";

// Imports from material ui
import { Typography, Box } from "@mui/material";

// Our Wishlist component
function Wishlist({
  stocks,
  wishlist,
  handleSelectStock,
  selectedStock,
  calculateStockPerformance,
}) {
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

            const dailyPerformance = calculateStockPerformance(currentStock);

            // Return the stock item
            return (
              <Box
                key={index}
                sx={{
                  padding: "0.5rem",
                  borderRadius: "8px",
                  width: "180px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  backgroundColor:
                    selectedStock &&
                    selectedStock.Ticker === currentStock.Ticker
                      ? "#f5f7f9"
                      : "white",
                  flexShrink: 0,
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
                  <div className="price">${currentPrice.toFixed(2)}</div>
                  <div className="daily-change">{dailyPerformance}</div>
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
                  onClick={(e) => {e.stopPropagation(); handleRemoveFromWishlist(ticker)}}
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
