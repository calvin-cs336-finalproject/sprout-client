// Imports from react
import React, {useState} from "react";

// Imports from material ui
import { Typography } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

// Imports from components
import GraphContainer from "./GraphContainer.js";

// Our SelectedStock component
function SelectedStock({
  selectedStock,
  handleRemoveFromWishlist,
  handleBuyStock,
  handleSellStock,
  handleAddToWishlist,
  portfolio,
  wishlist,
}) {
  const [quantity, setQuantity] = useState();

  // Function to save the quantity to local storage
  const saveQuantity = (event) => {
    const inputValue = event.target.value; // Get the current value from the event
    setQuantity(inputValue); // Update the state
    console.log(inputValue);
  };

  // Return the SelectedStock component
  return (
    <div className="selected-stock-box">
      {selectedStock ? (
        // Display the selected stock details
        <div className="stock-flex-box">
          <div className="selected-left-container">
            <div className="selected-top-box">
              {selectedStock && (
                <img
                  className="watch-img"
                  src={selectedStock.Image}
                  alt={selectedStock.Name}
                />
              )}
              <div>
                <h1>{selectedStock.Ticker}</h1>
                <h4>{selectedStock.Name}</h4>
              </div>
            </div>
            <h4 className="selected-status">
              Current Price: $
              {parseFloat(
                Object.values(
                  selectedStock.Prices[selectedStock.Prices.length - 1]
                )[0]
              ).toFixed(2)}
            </h4>
            <h4 className="selected-status">
              Stocks Owned:{" "}
              {portfolio.find((stock) => stock.Ticker === selectedStock.Ticker)
                ?.quantity || 0}
            </h4>
            <GraphContainer ticker={selectedStock.Ticker} />
          </div>
          <div className="selected-right-container">
            <div className="description-watch-box">
              <h4 className="description-title">Description:</h4>
              {(wishlist.find((stock) => stock === selectedStock.Ticker)) ? (
                <button
                  className="button"
                  onClick={() => handleRemoveFromWishlist(selectedStock.Ticker)}
                >
                  <VisibilityOffIcon className="watch-icon"/>
                </button>
              ) : (
                <button className="button" onClick={() => handleAddToWishlist(selectedStock)}>
                  <VisibilityIcon className="watch-icon" />
                </button>
              ) }
            </div>
            <p className="selected-stock-description">
              {selectedStock.Description}
            </p>
            <div className="button-amount-container">
              <h4>Amount</h4>
              <div className="buttons-container">
                <button className="buy" onClick={() => handleBuyStock(selectedStock, quantity)}> BUY</button>
                <input type="number" className="amount" min="1" onChange={saveQuantity} value={quantity}></input>
                <button className="sell" onClick={() => handleSellStock(selectedStock, quantity)}> SELL</button>
                {/* <Button
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
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleRemoveFromWishlist(selectedStock.Ticker)}
              >
                REMOVE
              </Button> */}
              </div>
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
