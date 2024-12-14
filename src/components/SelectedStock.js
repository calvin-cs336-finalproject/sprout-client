import React from "react";
import { Button, Typography } from "@mui/material";
import GraphContainer from "./GraphContainer.js";

function SelectedStock({ selectedStock, handleBuyStock, handleAddToWishlist }) {
  return (
    <div className="selected-stock-box">
      {selectedStock ? (
        <div className="stock-flex-box">
          <div>
            <Typography variant="h6">{selectedStock.Ticker}</Typography>
            <Typography variant="body1">
              Price: $
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
              [On phone in hallway] No, I know I need to work, I just- I feel
              weird not being home. It's OK here, but people sometimes take
              advantage because it's so relaxed. I'm a volunteer Sheriff's
              Deputy on the weekends. And you cannot screw around there. That's
              sort of one of the rules. [Singing as if he were the dolls in his
              office] Christmas tiiiime is heeeere! [Normal voice] Wow. Thanks
              guys, that sounded amazing. Hi, I'm Andy Bernard and I am the
              first office Santa ever to make holiday wishes come true.
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
                onClick={() => handleAddToWishlist(selectedStock)}
              >
                WATCH
              </Button>
              <div />
            </div>
          </div>
        </div>
      ) : (
        <Typography variant="body1" color="textSecondary">
          Select a stock to view details.
        </Typography>
      )}
    </div>
  );
}

export default SelectedStock;
