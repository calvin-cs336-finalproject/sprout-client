
import { collection, getDocs, doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.js';

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

export const getStockData = async (ticker, collectionName) => {
  const docRef = doc(db, collectionName, ticker);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    throw new Error(`No document found for ticker: ${ticker}`);
  }
};

export const getAllStockData = async (collectionName) => {
  try {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);

    const allStockData = [];
    querySnapshot.forEach((doc) => {
      allStockData.push({ id: doc.id, ...doc.data() });
    });

    console.log(`Successfully fetched all stock data from ${collectionName}`);
    return allStockData;
  } catch (error) {
    console.error("Error fetching all stock data: ", error);
    throw error;
  }
};

export const subscribeToStockData = (ticker, collectionName, callback) => {
  const docRef = doc(db, collectionName, ticker);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      console.warn(`No document found for ticker: ${ticker}`);
    }
  });
};

export const getAllUsers = async () => {
  try {
    const usersCollectionRef = collection(db, "users");
    const querySnapshot = await getDocs(usersCollectionRef);

    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    console.log("Successfully fetched all user data.");
    return users;
  } catch (error) {
    console.error("Error fetching users: ", error);
    throw error;
  }
};

export const createUserWithBalance = async (userId, email, initialBalance = 10000) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, {
      email: email,
      balance: initialBalance,
    });
    console.log("User created with initial balance:", initialBalance);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Function to fetch user data by user ID
export const getUserData = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data();
    } else {
      throw new Error("No user data found for ID:", userId);
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const updateUserBalance = async (userId, newBalance) => {
  try {
    // Reference to the user's document
    const userDocRef = doc(db, "users", userId);
    
    // Fetch the user document
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      // Update the user's balance
      await updateDoc(userDocRef, {
        balance: newBalance,
      });
      
      console.log(`User balance updated to: ${newBalance}`);
    } else {
      console.error("User not found");
    }
  } catch (error) {
    console.error("Error updating user balance:", error);
    throw error;
  }
};
