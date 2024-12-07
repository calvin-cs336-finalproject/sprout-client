import React from "react";

function Dashboard({ portfolio }) {
  const totalProfit = portfolio.reduce((acc, stock) => acc + stock.price, 0);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <p>Current Profit: ${totalProfit.toFixed(2)}</p>
      <h3>Your Investments:</h3>
      <ul>
        {portfolio.map((stock, index) => (
          <li key={index}>
            {stock.name} - ${stock.price.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
