
import { arrayRemove, arrayUnion, collection, getDocs, doc, setDoc, getDoc, updateDoc, onSnapshot, query, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

export const addToWishlist = async (userId, stock) => {
  try {
    if (!stock.Ticker) {
      throw new Error("Invalid stock data. Ticker is missing.");
    }

    // Reference to the user's document
    const userRef = doc(db, "users", userId);

    // Add the stock ticker to the wishlist array
    await updateDoc(userRef, {
      wishlist: arrayUnion(stock.Ticker),
    });

    console.log(`${stock.Ticker} added to wishlist.`);
  } catch (error) {
    console.error("Error adding stock to wishlist:", error);
    throw error; // Rethrow to allow further handling if needed
  }
};

export const getWishlist = async (userId) => {
  try {
    // Get a reference to the user's document
    const userRef = doc(db, 'users', userId);

    // Fetch the document snapshot
    const docSnapshot = await getDoc(userRef);

    // Check if the document exists and retrieve the wishlist array
    if (!docSnapshot.exists()) {
      console.log("No such document for user:", userId);
      return [];
    }

    // Get the wishlist array (defaults to an empty array if not present)
    const wishlist = docSnapshot.data()?.wishlist || [];

    console.log(`Successfully fetched wishlist for user: ${userId}`);
    return wishlist;
  } catch (error) {
    console.error("Error fetching user wishlist:", error);
    throw error;
  }
};

// Subscribe to changes in the user's wishlist
export const subscribeToWishlist = (userId, callback) => {
  const wishlistRef = collection(db, 'users', userId, 'wishlist');
  return onSnapshot(wishlistRef, (querySnapshot) => {
    const updatedWishlist = [];
    querySnapshot.forEach((doc) => {
      updatedWishlist.push({ id: doc.id, ...doc.data() });
    });
    callback(updatedWishlist);
  });
};

export const deleteFromWishlist = async (userId, stockTicker) => {
  try {
    if (!stockTicker) {
      throw new Error("Invalid stock ticker. Ticker is missing.");
    }

    // Reference to the user's document
    const userRef = doc(db, "users", userId);

    // Remove the stock ticker from the wishlist array
    await updateDoc(userRef, {
      wishlist: arrayRemove(stockTicker),
    });

    console.log(`${stockTicker} removed from wishlist.`);
  } catch (error) {
    console.error("Error removing stock from wishlist:", error);
    throw error; // Rethrow to allow further handling if needed
  }
};


export const updateUserPortfolio = async (userId, stock, action) => {
  try {
    const userPortfolioRef = collection(db, 'users', userId, 'portfolio');
    const stockDocRef = doc(userPortfolioRef, stock.Ticker); // Using Ticker as document ID
    const stockDocSnap = await getDoc(stockDocRef);

    // Ensure that stock has the required properties
    if (!stock.Ticker) {
      throw new Error("Stock data is incomplete. Ensure Ticker is defined.");
    }

    if (stockDocSnap.exists()) {
      const existingStock = stockDocSnap.data();
      const currentQuantity = existingStock.quantity || 0;

      // Calculate updated quantity based on action
      const updatedQuantity = action === 'buy'
        ? currentQuantity + 1
        : currentQuantity - 1;

      if (updatedQuantity <= 0) {
        // Remove stock from portfolio if quantity is 0 or less
        await deleteDoc(stockDocRef);
        console.log(`Stock ${stock.Ticker} removed from portfolio.`);
      } else {
        // Update the stock document with the new quantity
        await updateDoc(stockDocRef, {
          quantity: updatedQuantity,
          currentPrice: stock.currentPrice ?? existingStock.currentPrice, // Retain existing value if not provided
          percentChange: stock.percentChange ?? existingStock.percentChange, // Retain existing value if not provided
          Ticker: stock.Ticker,
        });
        console.log(`Updated stock ${stock.Ticker} in portfolio.`);
      }
    } else {
      // Add new stock if it doesn't exist
      if (action === 'sell') {
        throw new Error(`Cannot sell stock ${stock.Ticker} as it does not exist in the portfolio.`);
      }

      if (stock.quantity <= 0 || stock.currentPrice <= 0) {
        throw new Error("Invalid stock data. Ensure quantity and currentPrice are positive values.");
      }

      await setDoc(stockDocRef, {
        quantity: stock.quantity,
        currentPrice: stock.currentPrice,
        percentChange: stock.percentChange,
        Ticker: stock.Ticker,
      });
      console.log(`Added stock ${stock.Ticker} to portfolio.`);
    }
  } catch (error) {
    console.error("Error updating user portfolio:", error);
    throw error;
  }
};


// Create a user with an initial balance and initialize their portfolio subcollection
export const createUserWithBalance = async (userId, email, username, initialBalance = 10000) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, {
      email,
      username,
      balance: initialBalance,
      wishlist: [],
    });

    // Initialize the portfolio subcollection with an empty document
    const portfolioCollectionRef = collection(db, "users", userId, "portfolio");
    await setDoc(doc(portfolioCollectionRef, "initialization_doc"), { initialized: true });

    console.log("User created with initial balance and portfolio initialized.");
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Fetch the user's portfolio
export const getUserPortfolio = async (userId) => {
  try {
    const userPortfolioRef = collection(db, 'users', userId, 'portfolio');
    const querySnapshot = await getDocs(userPortfolioRef);

    const portfolio = [];
    querySnapshot.forEach((doc) => {
      if (doc.id !== "initialization_doc") {
        portfolio.push({ id: doc.id, ...doc.data() });
      }
    });

    console.log(`Successfully fetched portfolio for user: ${userId}`);
    return portfolio;
  } catch (error) {
    console.error("Error fetching user portfolio:", error);
    throw error;
  }
};

// Subscribe to the user's portfolio changes
export const subscribeToUserPortfolio = (userId, callback) => {
  const userPortfolioRef = collection(db, 'users', userId, 'portfolio');
  return onSnapshot(userPortfolioRef, (querySnapshot) => {
    const updatedPortfolio = [];
    querySnapshot.forEach((doc) => {
      updatedPortfolio.push({ id: doc.id, ...doc.data() });
    });
    callback(updatedPortfolio);
  });
};

// Add stock data (price and percent change)
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

// Fetch all stock data
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

export const getTopUsersByBalance = async () => {
  try {
    const usersRef = collection(db, 'users');
    const topUsersQuery = query(usersRef, orderBy('balance', 'desc'), limit(5));
    const querySnapshot = await getDocs(topUsersQuery);

    const topUsers = [];
    querySnapshot.forEach((doc) => {
      topUsers.push({ id: doc.id, ...doc.data() });
    });

    return topUsers;
  } catch (error) {
    console.error('Error fetching top users by balance: ', error);
    throw error;
  }
};