// Imports from react
import React, { useEffect, useState } from "react";

// Imports from Firebase
import { db } from "../firebase.js";
import { doc, getDoc } from "firebase/firestore";

// Imports from components
import Graph from "./Graph.js";

// Our graph container component
const GraphContainer = ({ ticker, collectionName = "stocks" }) => {
  const [data, setData] = useState([]);

  // useEffect hook to fetch data from Firestore
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const docRef = doc(db, collectionName, ticker);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const rawData = docSnap.data().Prices || [];

          // Convert Firestore data into usable format
          const parsedData = rawData.map((item) => {
            const [date, closePrice] = Object.entries(item)[0];
            return { date: date, close: closePrice };
          });
          setData(parsedData);
        } else {
          console.warn(`No document found for ticker: ${ticker}`);
        }
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStockData();
  }, [ticker, collectionName]);

  // Return the Graph component with the data
  return (
    <div>
      {data.length > 0 ? (
        <Graph data={data} />
      ) : (
        <p>Loading data for {ticker}...</p>
      )}
    </div>
  );
};

export default GraphContainer;
