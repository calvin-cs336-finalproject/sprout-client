// Import from react
import React, { useEffect, useState } from 'react';

// Import from material ui
import { Grid2, Typography, List, ListItem, Box } from '@mui/material';

// Imports from our firestore service
import { getTopUsersByBalance } from '../services/firestoreService.js';


// Leaderboard component
function Leaderboard() {
  const [topUsers, setTopUsers] = useState([]);

  // useEffect hook to fetch top users from Firestore
  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const users = await getTopUsersByBalance();
        setTopUsers(users);
      } catch (error) {
        console.error('Error loading leaderboard: ', error);
      }
    };

    fetchTopUsers();
  }, []);

  console.log(topUsers);

  // Return the leaderboard component
  return (
    <Grid2 item xs={12} md={4}>
      <Typography variant="h5">
        Leaderboard
      </Typography>
      <List>
        {/* List of top users */}
        {topUsers.map((user, index) => (
          <ListItem
            key={user.id}
          >
            <Box>
              {/* Display user's username and balance */}
              <Typography variant="subtitle1">
                {index + 1}. {user.username || 'Anonymous'}: ${user.balance?.toFixed(2) || '0.00'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>
    </Grid2>
  );
}

export default Leaderboard;
