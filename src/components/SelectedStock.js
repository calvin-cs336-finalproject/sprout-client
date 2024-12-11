import React from "react";
import { Card, CardContent, Button, Typography, Grid2 } from "@mui/material";
import GraphContainer from "./GraphContainer.js";

function SelectedStock({ selectedStock, handleBuyStock }) {
    return (
      <Grid2 item xs={12} md={6.2}>
          <Typography variant="h5" gutterBottom>
            Selected Stock
          </Typography>
          {selectedStock ? (
            <Card>
              <CardContent>
                <Typography variant="h6">{selectedStock.Ticker}</Typography>
                <Typography variant="body1">
                  Price: ${parseFloat(Object.values(selectedStock.Prices[selectedStock.Prices.length - 1])[0]).toFixed(2)}
                </Typography>
                <GraphContainer ticker={selectedStock.Ticker} />
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  style={{ marginTop: "1rem" }}
                  onClick={() => handleBuyStock(selectedStock)}
                >
                  Buy Stock
                </Button>
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
