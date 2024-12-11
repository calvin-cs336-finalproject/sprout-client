import React from "react";
import { Card, CardContent, Button, Typography, Grid2 } from "@mui/material";
import GraphContainer from "./GraphContainer.js";

function SelectedStock({ selectedStock, handleBuyStock, handleAddToWishlist }) {

  return (
    <Grid2 item xs={12} md={6.2}>
      {selectedStock ? (
        <Card>
          <CardContent>
            <Typography variant="h6">{selectedStock.Ticker}</Typography>
            <Typography variant="body1">
              Price: ${parseFloat(Object.values(selectedStock.Prices[selectedStock.Prices.length - 1])[0]).toFixed(2)}
            </Typography>
            <GraphContainer ticker={selectedStock.Ticker} />

            <Grid2 container spacing={2} style={{ marginTop: "1rem" }}>
              <Grid2 item xs={6}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handleBuyStock(selectedStock)}
                >
                  Buy Stock
                </Button>
              </Grid2>
              <Grid2 item xs={6}>
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  onClick={() => handleAddToWishlist(selectedStock)}
                >
                  Add to Watchlist
                </Button>
              </Grid2>
            </Grid2>
          </CardContent>
        </Card>
      ) : (
        <Typography variant="body1" color="textSecondary">
          Select a stock to view details.
        </Typography>
      )}
    </Grid2>
  );
}

export default SelectedStock;
