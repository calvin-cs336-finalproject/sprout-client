import React from "react";

function Stocks({ stocks, onStockSelect }) {
  return (
    <div className="stocks-section">
      <h2>Stocks</h2>
      <input type="text" placeholder="Search" className="search-bar" />
      <div className="stocks-list">
        {stocks.map((stock) => (
          <div
            key={stock.id}
            className="stock-card"
            onClick={() => onStockSelect(stock)}
          >
            <p>{stock.name}</p>
            <p>Current Price: ${stock.price.toFixed(2)}</p>
            <div className="stock-logo">{stock.logo}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Stocks;
