import React, { useState } from "react";
import { Box, Typography, TextField, List, ListItem, Grid2 } from "@mui/material";

function Stocks({ stocks, selectedStock, setSelectedStock }) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Grid2 item xs={12} md={4}>
          <Typography variant="h5" gutterBottom>
            Stocks
          </Typography>
          <TextField
            fullWidth
            label="Search Stocks"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Handle search input change
            margin="normal"
          />
          <List sx={{ maxHeight: "400px", overflowY: "scroll", padding: "1rem" }}>
            {stocks
              .filter((stock) =>
                stock.Ticker?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((stock, index) => {
                const latestPriceObj = stock.Prices[stock.Prices.length - 1];
                const latestPriceValue = latestPriceObj
                  ? Object.values(latestPriceObj)[0]
                  : 'N/A';
                return (
                  <ListItem
                    key={index}
                    button
                    onClick={() => setSelectedStock(stock)}
                    selected={selectedStock?.Ticker === stock.Ticker}
                    style={{
                      border: "1px solid #ddd",
                      marginBottom: "0.5rem",
                      borderRadius: "5px",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1">{stock.Ticker}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Price: ${latestPriceValue !== 'N/A' ? parseFloat(latestPriceValue).toFixed(2) : 'N/A'}
                      </Typography>
                    </Box>
                  </ListItem>
                );
              })}
          </List>
        </Grid2>
  );
}

export default Stocks;
