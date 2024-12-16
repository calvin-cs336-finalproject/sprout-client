// Import from react
import React, { useEffect, useState } from "react";

// Import from material ui
import { List, ListItem } from "@mui/material";

// Imports from our firestore service
import { getTopUsersByBalance } from "../services/firestoreService.js";

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
        console.error("Error loading leaderboard: ", error);
      }
    };

    fetchTopUsers();
  }, []);

  console.log(topUsers);

  // Return the leaderboard component
  return (
    <List>
      {topUsers.map((user, index) => (
        <ListItem key={user.id}>
          <div className="leaderboard-item">
            <div
              className="leaderboard-rank"
              style={{
                backgroundColor: `rgba(20, 174, 92, ${
                  (100 - 10 * index) / 100
                })`,
              }}
            >
              {index + 1}
            </div>
            <div className="user-value">
              <h3>{user.username || "Anonymous"}</h3>
              <div className="price">
                ${user.totalBalance?.toFixed(2) || "0.00"}
              </div>
            </div>
          </div>
        </ListItem>
      ))}
    </List>
  );
}

export default Leaderboard;
