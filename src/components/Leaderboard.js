import React from "react";

function Leaderboard({ leaderboard }) {
  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      <ol>
        {leaderboard.map((user, index) => (
          <li key={index}>
            {user.username} - ${user.profit}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default Leaderboard;
