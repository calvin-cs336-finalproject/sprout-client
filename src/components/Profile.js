import React, { useState } from "react";
import { Box, Button, Menu, MenuItem, Typography } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";

function ProfileDropdown({ username, handleLogout }) {
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <Button
        variant="text"
        color="inherit"
        onClick={handleClick}
        startIcon={<AccountCircle />}
      >
        <Typography variant="body1" style={{ textTransform: 'none' }}>{username}</Typography>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            width: "200px", // Adjust width as needed
            padding: "10px",
          },
        }}
      >
        <MenuItem onClick={handleLogout}>
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default ProfileDropdown;
