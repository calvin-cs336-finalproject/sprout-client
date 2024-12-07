import React from "react";

function SelectedStock({ stock, onBuyStock }) {
  if (!stock) {
    return (
      <div className="selected-stock">
        <h2>Selected Stock</h2>
        <p>Please select a stock to view details.</p>
      </div>
    );
  }

  return (
    <div className="selected-stock">
      <h2>{stock.name}</h2>
      <p>Current Price: ${stock.price.toFixed(2)}</p>
      <p>Info about the selected stock.</p>
      <button onClick={() => onBuyStock(stock)}>Buy Stock</button>
    </div>
  );
}

export default SelectedStock;
