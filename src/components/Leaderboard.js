import React, { useEffect, useState } from 'react';
import { Grid2, Typography, List, ListItem, Box } from '@mui/material';
import { getTopUsersByBalance } from '../services/firestoreService.js';

function Leaderboard() {
  const [topUsers, setTopUsers] = useState([]);

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

  return (
    <Grid2 item xs={12} md={4}>
      <Typography variant="h5" gutterBottom>
        Leaderboard
      </Typography>
      <List>
        {topUsers.map((user, index) => (
          <ListItem
            key={user.id}
            style={{
              border: '1px solid #ddd',
              marginBottom: '0.5rem',
              borderRadius: '5px',
            }}
          >
            <Box>
              <Typography variant="subtitle1">
                #{index + 1}: {user.username || 'Anonymous'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Balance: ${user.balance?.toFixed(2) || '0.00'}
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>
    </Grid2>
  );
}

export default Leaderboard;
