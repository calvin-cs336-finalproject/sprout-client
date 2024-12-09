import React from "react";
import { Grid2, Typography, List, ListItem, Box, Button } from "@mui/material";

function Portfolio({stocks, portfolio, handleBuyStock, handleSellStock}) {
    return (
        <Grid2 item xs={12} md={4}>
          <Typography variant="h5" gutterBottom>
            Portfolio
          </Typography>
          <List>
            {portfolio.map((stock, index) => {
              const currentStock = stocks.find((s) => s.Ticker === stock.Ticker);
              const currentPrice = currentStock ? Object.values(currentStock.Prices[currentStock.Prices.length - 1])[0] : 0;
              return (
                <ListItem
                  key={index}
                  style={{
                    border: "1px solid #ddd",
                    marginBottom: "0.5rem",
                    borderRadius: "5px",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">
                      {stock.Ticker} - {stock.quantity} Share(s)
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Current Price: ${parseFloat(currentPrice).toFixed(2)}
                    </Typography>
                    {/* <Typography variant="body2" color="textSecondary">
                      Change:{" "}
                      {calculatePercentageChange(currentPrice, stock.averagePrice).toFixed(2)}%
                    </Typography> */}
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleBuyStock(stock)}
                      style={{ marginTop: "0.5rem" }}
                    >
                      Buy
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleSellStock(stock)}
                      style={{ marginTop: "0.5rem", marginLeft: "0.5rem" }}
                    >
                      Sell
                    </Button>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        </Grid2>
    );
}

export default Portfolio;