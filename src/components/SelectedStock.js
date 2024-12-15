// Imports from react
import React from "react";

// Imports from material ui
import { Button, Typography } from "@mui/material";

// Imports from components
import GraphContainer from "./GraphContainer.js";

// Our SelectedStock component
function SelectedStock({ selectedStock, handleBuyStock, handleSellStock, handleAddToWishlist }) {

  // Return the SelectedStock component
  return (
    <div className="selected-stock-box">
      {selectedStock ? (
        // Display the selected stock details
        <div className="stock-flex-box">
          <div>
            <Typography variant="h6">{selectedStock.Name} - {selectedStock.Ticker}</Typography>
            <Typography variant="body1">
              Current Price: $
              {parseFloat(
                Object.values(
                  selectedStock.Prices[selectedStock.Prices.length - 1]
                )[0]
              ).toFixed(2)}
            </Typography>
            <GraphContainer ticker={selectedStock.Ticker} />
          </div>
          <div className="para-butt-flex-box-container">
            <p className="pad-between-button">
              {selectedStock.Description}
            </p>
            <div className="butt-flex">
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleBuyStock(selectedStock)}
              >
                BUY
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleSellStock(selectedStock)}
              >
                Sell
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleAddToWishlist(selectedStock)}
              >
                WATCH
              </Button>
              <div />
            </div>
          </div>
        </div>
      ) : (
        // Display a message if no stock is selected
        <Typography variant="body1" color="textSecondary">
          Select a stock to view details.
        </Typography>
      )}
    </div>
  );
}

export default SelectedStock;
