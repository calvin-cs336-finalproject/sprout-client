// Imports from react
import React, { useState } from "react";

// Imports from material ui
import {
  Box,
  Typography,
  List,
  ListItem,
  Popover,
  InputBase,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

// Our StockSearch component
function StockSearch({ stocks, selectedStock, setSelectedStock }) {
  // useState hook to manage the search term
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  // Functions to handle opening and closing the popover
  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  // Function to filter the stocks based on the search term
  const filteredStocks = stocks.filter((stock) =>
    stock.Ticker?.toLowerCase().includes(searchTerm.toLowerCase()) || stock.Name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Return the StockSearch component
  return (
    <Box className="search-box">
      <SearchIcon className="search-icon" />
      <InputBase
        className="search-field"
        fullWidth
        autoComplete="off"
        placeholder="Search for various stocks"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={handleOpen}
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
            maxHeight: 300,
            width: anchorEl?.offsetWidth || 300,
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
                  : "N/A";
                return (
                  <ListItem
                    key={index}
                    button
                    onClick={() => {
                      setSelectedStock(stock);
                      handleClose();
                    }}
                    selected={selectedStock?.Ticker === stock.Ticker}
                    style={{
                      border: "1px solid #ddd",
                      marginBottom: "0.5rem",
                      borderRadius: "5px",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1">
                      {stock.Name} - {stock.Ticker}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Price: $
                        {latestPriceValue !== "N/A"
                          ? parseFloat(latestPriceValue).toFixed(2)
                          : "N/A"}
                      </Typography>
                    </Box>
                  </ListItem>
                );
              })
            ) : (
              // Display a message if no stocks are found
              <Typography variant="body2" color="textSecondary">
                No stocks found.
              </Typography>
            )}
          </List>
        ) : (
          // Display a message if no stocks are available
          <Typography variant="body2" color="textSecondary">
            No stocks available.
          </Typography>
        )}
      </Popover>
    </Box>
  );
}

export default StockSearch;
