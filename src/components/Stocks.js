import React, { useState } from "react";
import { Box, Typography, TextField, List, ListItem, Popover } from "@mui/material";

function Stocks({ stocks, selectedStock, setSelectedStock }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const filteredStocks = stocks.filter((stock) =>
    stock.Ticker?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <TextField
        fullWidth
        label="Search for various stocks"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={handleOpen} // Open popup when the input is selected
        margin="normal"
        sx={{
          width: '400px',
        }}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        disableRestoreFocus
        disableAutoFocus
        PaperProps={{
          style: {
            maxHeight: 300, // Limit height for scroll
            width: anchorEl?.offsetWidth || 300, // Match width of the TextField
            padding: "0.5rem",
          },
        }}
      >
        {stocks.length > 0 ? (
          <List>
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock, index) => {
                const latestPriceObj = stock.Prices[stock.Prices.length - 1];
                const latestPriceValue = latestPriceObj
                  ? Object.values(latestPriceObj)[0]
                  : 'N/A';
                return (
                  <ListItem
                    key={index}
                    button
                    onClick={() => {
                      setSelectedStock(stock);
                      handleClose(); // Close popup on selection
                    }}
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
              })
            ) : (
              <Typography variant="body2" color="textSecondary">
                No stocks found.
              </Typography>
            )}
          </List>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No stocks available.
          </Typography>
        )}
      </Popover>
    </Box>
  );
}

export default Stocks;
