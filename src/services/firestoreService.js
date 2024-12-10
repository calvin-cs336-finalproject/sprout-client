
// src/services/firestoreService.js
import { collection, addDoc, getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import dotenv from 'dotenv';
dotenv.config();

export const addStockData = async (ticker, date, closePrice, collectionName) => {
  try {
    const docRef = doc(db, collectionName, ticker);
    const docSnap = await getDoc(docRef);

    let existingData = {};
    if (docSnap.exists()) {
      existingData = docSnap.data();
    }

    // Ensure Prices is an array
    const prices = Array.isArray(existingData.Prices) ? existingData.Prices : [];

    // Add the new price
    if (date && closePrice !== undefined) {
      prices.push({ [date]: closePrice });
    } else {
      throw new Error(`Invalid data: date=${date}, closePrice=${closePrice}`);
    }

    if (!docSnap.exists()) {
      await setDoc(docRef, {
        Ticker: ticker,
        Prices: prices,
      });
      console.log(`Created new document for ${ticker}`);
    } else {
      // If the document exists, update it
      await updateDoc(docRef, {
        Prices: prices,
      });
      console.log(`Updated existing document for ${ticker}`);
    }
    console.log(`Successfully added data for ${ticker} on ${date}: ${closePrice}`);
  } catch (error) {
    console.error("Error adding stock data: ", error);
    throw error;
  }
};

// const testAddStockData = async () => {
//   const ticker = 'FAKE';
//   const date = '2024-12-01';
//   const closePrice = 124.21;

//   await addStockData(ticker, date, closePrice);

//   // Test adding another date
//   const newDate = '2024-12-02';
//   const newClosePrice = 126.45;
//   await addStockData(ticker, newDate, newClosePrice);
// };
