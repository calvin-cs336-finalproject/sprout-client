import {
  arrayRemove,
  arrayUnion,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase.js";

/**
 * This function is used to add a selected stock to the watchlist -- if the stock
 * already exists in the watchlist on database, it is not added again. This is what the
 * arrayUnion function is used for.
 * @param {*} userId
 * @param {*} stock
 */
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
    throw error;
  }
};

/**
 * Fetch the user's watchlist from the database.
 * Returns an empty list if the watchlist is empty, or the user doesn't
 * exist (but the user should always exist if this function is called).
 *
 * @param {*} userId
 */
export const getWishlist = async (userId) => {
  try {
    // Get a reference to the user's document
    const userRef = doc(db, "users", userId);

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

/**
 * Function to subscribe to changes in the user's wishlist.
 * The onSnapshot() function listens for changes to the watchlist.
 * If a change occurs, the watchlist is iterated over and then returned
 * via a callback.
 * @param {*} userId
 * @param {*} callback
 */
export const subscribeToWishlist = (userId, callback) => {
  const wishlistRef = collection(db, "users", userId, "wishlist");
  return onSnapshot(wishlistRef, (querySnapshot) => {
    const updatedWishlist = [];
    querySnapshot.forEach((doc) => {
      updatedWishlist.push({ id: doc.id, ...doc.data() });
    });
    callback(updatedWishlist);
  });
};

/**
 * Remove a stock from the user's wishlist. The removeArray()
 * function is used to remove the ticker from the list nicely.
 *
 * @param {*} userId
 * @param {*} stockTicker
 */
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

/**
 * Updates the user's portfolio to reflect the most recent share price of the stock.
 * This is done by looping through each stock that the user has in their portfolio,
 * and updating each stock to reflect the new price and the percent change compared to
 * the old price.
 *
 * @param {*} userId
 * @param {*} latestPrices
 */
export const updatePortfolioWithLatestPrices = async (userId, latestPrices) => {
  try {
    const userPortfolioRef = collection(db, "users", userId, "portfolio");
    const querySnapshot = await getDocs(userPortfolioRef);

    // Iterate over each stock in the user's portfolio
    for (const docSnapshot of querySnapshot.docs) {
      const stock = docSnapshot.data();
      const latestPrice = latestPrices[stock.Ticker];

      if (latestPrice !== undefined) {
        const stockDocRef = doc(db, "users", userId, "portfolio", stock.Ticker);

        await updateDoc(stockDocRef, {
          currentPrice: latestPrice,
          percentChange:
            ((latestPrice - stock.purchasePrice) / stock.purchasePrice) * 100,
        });
      }
    }

    console.log(`Successfully updated portfolio for user: ${userId}`);
  } catch (error) {
    console.error("Error updating portfolio with latest prices: ", error);
    throw error;
  }
};

/**
 * Gets the latest prices from the database and returns them
 * as an object with key, value pairs for each stock.
 * @param {*} collectionName
 * @returns
 */
export const getLatestPrices = async (collectionName) => {
  try {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);

    const latestPrices = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const latestPriceObj = data.Prices[data.Prices.length - 1];
      const latestPrice = latestPriceObj ? Object.values(latestPriceObj)[0] : 0;
      latestPrices[doc.id] = latestPrice;
    });

    console.log(`Successfully fetched latest prices from ${collectionName}`);
    return latestPrices;
  } catch (error) {
    console.error("Error fetching latest prices: ", error);
    throw error;
  }
};

/**
 * Updates the user's portfolio in the database whether the user is buying or selling shares
 * of a stock. If the stock does not exist in the portfolio and the user wants to buy it, then
 * the stock is added to the portfolio. If the user wants to sell a share, a share of that stock
 * is removed - if it is the last share of the stock, the entire stock must be removed from the
 * portfolio.
 *
 * @param {*} userId
 * @param {*} stock
 * @param {*} action
 */
export const updateUserPortfolio = async (userId, stock, action) => {
  try {
    const userPortfolioRef = collection(db, "users", userId, "portfolio");
    const stockDocRef = doc(userPortfolioRef, stock.Ticker); // Using Ticker as document ID
    const stockDocSnap = await getDoc(stockDocRef);

    // Ensure that stock has the required properties
    // if (!stock.Ticker) {
    //   throw new Error("Stock data is incomplete. Ensure Ticker is defined.");
    // }

    if (stockDocSnap.exists()) {
      const existingStock = stockDocSnap.data();

      // Calculate updated quantity based on action
      const updatedQuantity = stock.quantity;

      if (updatedQuantity <= 0) {
        // Remove stock from portfolio if quantity is 0 or less
        await deleteDoc(stockDocRef);
        console.log(`Stock ${stock.Ticker} removed from portfolio.`);
      } else {
        // Update the stock document with the new quantity
        await updateDoc(stockDocRef, {
          quantity: updatedQuantity,
          currentPrice: stock.currentPrice ?? existingStock.currentPrice, // Retain existing value if not provided
          percentChange:
            ((stock.currentPrice - stock.purchasePrice) / stock.currentPrice) *
            100, // Retain existing value if not provided
          Ticker: stock.Ticker,
        });
        console.log(`Updated stock ${stock.Ticker} in portfolio.`);
      }
    } else {
      // Add new stock if it doesn't exist
      if (action === "sell") {
        throw new Error(
          `Cannot sell stock ${stock.Ticker} as it does not exist in the portfolio.`
        );
      }

      if (stock.quantity <= 0 || stock.currentPrice <= 0) {
        throw new Error(
          "Invalid stock data. Ensure quantity and currentPrice are positive values."
        );
      }

      await setDoc(stockDocRef, {
        quantity: stock.quantity,
        currentPrice: stock.currentPrice,
        purchasePrice: stock.currentPrice,
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

/**
 * Updates the total balance for the user in the database.
 * @param {*} userId
 * @param {*} totalBalance
 */
export const setTotalUserBalance = async (userId, totalBalance) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      totalBalance: this.totalBalance,
    });

    console.log(`User total balance updated to: ${totalBalance}`);
  } catch (error) {
    console.error("Error updating user total balance:", error);
    throw error;
  }
};

/**
 * When an account is added, a document in the database needs to be created
 * to store account details, and set an initial balance.
 * @param {*} userId
 * @param {*} email
 * @param {*} username
 * @param {*} initialBalance
 */
export const createUserWithBalance = async (
  userId,
  email,
  username,
  initialBalance = 10000
) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, {
      email,
      username,
      balance: initialBalance,
      totalBalance: initialBalance,
      wishlist: [],
    });

    // Initialize the portfolio subcollection with an empty initialization document
    const portfolioCollectionRef = collection(db, "users", userId, "portfolio");
    await setDoc(doc(portfolioCollectionRef, "initialization_doc"), {
      initialized: true,
    });

    console.log("User created with initial balance and portfolio initialized.");
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

/**
 * returns a list of stocks that are in the users portfolio
 * @param {*} userId
 */
export const getUserPortfolio = async (userId) => {
  try {
    const userPortfolioRef = collection(db, "users", userId, "portfolio");
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

/**
 * Listen for event changes in the users portfolio, so when
 * changes to the DB occur so that the display can be updated accordingly
 * @param {*} userId
 * @param {*} callback
 */
export const subscribeToUserPortfolio = (userId, callback) => {
  const userPortfolioRef = collection(db, "users", userId, "portfolio");
  return onSnapshot(userPortfolioRef, (querySnapshot) => {
    const updatedPortfolio = [];
    querySnapshot.forEach((doc) => {
      updatedPortfolio.push({ id: doc.id, ...doc.data() });
    });
    callback(updatedPortfolio);
  });
};

/**
 * Adds stock data to the database.
 * This function is used by the PolygonService. Once data is pulled
 * from the API, it uses this function to store the stock data into
 * firestore. There is a check to make sure that duplicate data is not
 * added.
 * @param {*} ticker
 * @param {*} date
 * @param {*} closePrice
 * @param {*} collectionName
 */
export const addStockData = async (
  ticker,
  date,
  closePrice,
  collectionName
) => {
  try {
    const docRef = doc(db, collectionName, ticker);
    const docSnap = await getDoc(docRef);

    let existingData = {};
    if (docSnap.exists()) {
      existingData = docSnap.data();
    }

    // Ensure Prices is an array
    const prices = Array.isArray(existingData.Prices)
      ? existingData.Prices
      : [];

    // Check if the date already exists in the Prices array
    const isDateAlreadyPresent = prices.some(
      (entry) => entry[date] !== undefined
    );
    if (isDateAlreadyPresent) {
      console.log(`Data for ${ticker} on ${date} already exists. Skipping.`);
      return;
    }

    // Add the new price
    if (date && closePrice !== undefined) {
      prices.push({ [date]: closePrice });
    } else {
      throw new Error(`Invalid data: date=${date}, closePrice=${closePrice}`);
    }

    // If the document doesn't exist, create it
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
    console.log(
      `Successfully added data for ${ticker} on ${date}: ${closePrice}`
    );
  } catch (error) {
    console.error("Error adding stock data: ", error);
    throw error;
  }
};

/**
 *Fetches data for all stocks in the "stocks" collection
 *
 * @param {*} collectionName
 */
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

// Function to subscribe to stock data changes
/**
 * Event listener to see if there are changes in a particular
 * stock can be displayed - this is not currently used
 * @param {*} ticker
 * @param {*} collectionName
 * @param {*} callback
 */
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

// Function to get all users from the database
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

// Function to fetch user data by a user ID for specific user data
export const getUserData = async (userId) => {
  try {
    // Reference to the user's document
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

// Function to update the user's balance with new balance
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

// Function to get the top 5 users by balance for the leaderboard
export const getTopUsersByBalance = async () => {
  try {
    const usersRef = collection(db, "users");
    const topUsersQuery = query(usersRef, orderBy("balance", "desc"), limit(5));
    const querySnapshot = await getDocs(topUsersQuery);

    const topUsers = [];
    querySnapshot.forEach((doc) => {
      topUsers.push({ id: doc.id, ...doc.data() });
    });

    return topUsers;
  } catch (error) {
    console.error("Error fetching top users by balance: ", error);
    throw error;
  }
};
