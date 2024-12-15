// Imports from react
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Imports from material ui
import Accordion from "@mui/material/Accordion/index.js";
import AccordionSummary from "@mui/material/AccordionSummary/index.js";
import AccordionDetails from "@mui/material/AccordionDetails/index.js";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import StraightIcon from "@mui/icons-material/Straight";
import Typography from "@mui/material/Typography/index.js";

// Imports from our firestore service and firebase
import {
  getAllStockData,
  getUserData,
  updateUserBalance,
  updateUserPortfolio,
  getUserPortfolio,
  addToWishlist,
  getWishlist,
  deleteFromWishlist,
  getLatestPrices,
  updatePortfolioWithLatestPrices,
} from "../services/firestoreService.js";
import { auth } from "../firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import SelectedStock from "../components/SelectedStock.js";
import Portfolio from "../components/Portfolio.js";
import StockSearch from "../components/StockSearch.js";
import Leaderboard from "../components/Leaderboard.js";
import Wishlist from "../components/Wishlist.js";
import ProfileDropdown from "../components/Profile.js";

// Our main page component
function MainPage() {
  // useState hooks for everything we need to keep track of
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [userBalance, setUserBalance] = useState(10000);
  const [username, setUsername] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // useEffect hook to fetch the stock data from our firestore
  useEffect(() => {
    async function fetchStocks() {
      try {
        const fetchedStocks = await getAllStockData("stocks");
        setStocks(fetchedStocks);
      } catch (error) {
        console.error("Error loading stocks:", error);
      }
    }
    fetchStocks();
  }, []);

  // useEffect hook to fetch the user data from our firestore and updating portfolio
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userData = await getUserData(currentUser.uid);
          console.log("User Data:", userData);
          setUserBalance(userData.balance);
          setUsername(userData.username);

          const profile = await getUserPortfolio(currentUser.uid);
          setPortfolio(profile);

          const watchlist = await getWishlist(currentUser.uid);
          setWishlist(watchlist);

          const latestPrices = await getLatestPrices("stocks");
          await updatePortfolioWithLatestPrices(currentUser.uid, latestPrices);
        } catch (error) {
          console.error("Error fetching user data or profile:", error);
        }
      } else {
        setUser(null);
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Function to handle buying a stock
  const handleBuyStock = async (currentStock) => {
    if (
      !currentStock ||
      !currentStock.Prices ||
      currentStock.Prices.length === 0
    ) {
      console.error(
        "Invalid stock data or missing prices for the stock:",
        currentStock
      );
      return;
    }

    // Get the latest price for the selected stock
    const latestPrice = currentStock.Prices[currentStock.Prices.length - 1];
    const price = latestPrice ? Object.values(latestPrice)[0] : 0;

    // Check if the user has enough balance to buy the stock and update the balance accordingly
    if (userBalance >= price) {
      const newBalance = userBalance - price;
      setUserBalance(newBalance);
      updateUserBalance(user.uid, newBalance);

      // Update the portfolio with the new stock or update current stocks
      setPortfolio((prev) => {
        const stockIndex = prev.findIndex(
          (item) => item.Ticker === currentStock.Ticker
        );

        if (
          currentStock.Ticker ===
          wishlist.find((s) => s === currentStock.Ticker)
        ) {
          handleRemoveFromWishlist(currentStock.Ticker);
        }

        let updatedPortfolio;

        if (stockIndex !== -1) {
          updatedPortfolio = prev.map((item, index) =>
            index === stockIndex
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item
          );
        } else {
          updatedPortfolio = [
            ...prev,
            {
              Ticker: currentStock.Ticker,
              quantity: 1,
              currentPrice: price,
              percentChange: 0,
              purchasePrice: price,
            },
          ];
        }

        // Update Firestore portfolio with required fields
        const updatedStock = updatedPortfolio.find(
          (item) => item.Ticker === currentStock.Ticker
        );
        if (updatedStock) {
          const currentPrice = price;
          const percentChange = calculatePercentageChange(
            currentPrice,
            updatedStock.averagePrice
          );
          updateUserPortfolio(
            user.uid,
            {
              ...updatedStock,
              currentPrice,
              percentChange,
            },
            "buy"
          );
        }

        return updatedPortfolio;
      });
    } else {
      alert("Not enough balance to buy this stock!");
    }
  };

  // Function to handle selling a stock
  const handleSellStock = async (stockToSell) => {
    const currentStock = stocks.find((s) => s.Ticker === stockToSell.Ticker);
    console.log("Current Stock:", currentStock);
    if (!currentStock) return;

    if (stockToSell.quantity > 0) {
      const currentPrice = Object.values(
        currentStock.Prices[currentStock.Prices.length - 1]
      )[0];
      const newBalance = userBalance + currentPrice;
      setUserBalance(newBalance);
      updateUserBalance(user.uid, newBalance);

      // Update the portfolio with the new stock or update current stocks
      setPortfolio((prev) => {
        const updatedPortfolio = prev
          .map((item) =>
            item.Ticker === stockToSell.Ticker
              ? {
                  ...item,
                  quantity: item.quantity - 1,
                  totalInvested: item.totalInvested - item.averagePrice,
                }
              : item
          )
          .filter((item) => item.quantity > 0);

        // Update Firestore portfolio with required fields
        const updatedStock =
          updatedPortfolio.find((item) => item.Ticker === stockToSell.Ticker) ||
          null;

        const percentChange = calculatePercentageChange(
          currentPrice,
          stockToSell.purchasePrice
        );
        updateUserPortfolio(
          user.uid,
          {
            ...stockToSell,
            currentPrice,
            percentChange,
            quantity: updatedStock ? updatedStock.quantity : 0,
          },
          "sell"
        );

        return updatedPortfolio;
      });
    } else {
      alert("You don't own enough of this stock to sell!");
    }
  };

  // Function to handle adding a stock to the wishlist
  const handleAddToWishlist = async (stock) => {
    const isInPortfolio = portfolio.some((s) => s.Ticker === stock.Ticker);
    if (isInPortfolio) {
      console.log(
        "Stock is already in the portfolio and cannot be added to the wishlist."
      );
      return;
    }

    // Check if the stock is already in the wishlist
    try {
      const stockExists = wishlist.some((item) => item.Ticker === stock.Ticker);

      if (stockExists) {
        console.log(`${stock.Ticker} is already in the wishlist`);
        return;
      }

      // Call the addToWishlist function from our service to add the stock to the wishlist
      await addToWishlist(user.uid, stock);

      const watchlist = await getWishlist(user.uid);
      setWishlist(watchlist);

      console.log(`${stock.Ticker} added to wishlist`);
    } catch (error) {
      console.error("Error adding stock to wishlist:", error);
    }
  };

  // Function to handle removing a stock from the wishlist
  const handleRemoveFromWishlist = async (stockTicker) => {
    try {

      // Call the deleteFromWishlist function from our service
      await deleteFromWishlist(user.uid, stockTicker);

      const watchlist = await getWishlist(user.uid);
      setWishlist(watchlist);

      console.log(`Stock ${stockTicker} removed from wishlist.`);
    } catch (error) {
      console.error("Error removing stock from wishlist:", error);
    }
  };

  // Function to calculate the percentage change between your portfolios stock's purchase price and the current price
  const calculatePercentageChange = (currentPrice, purchasePrice) => {
    console.log("Current Price:", currentPrice);
    console.log("Purchase Price:", purchasePrice);
    return ((currentPrice - purchasePrice) / purchasePrice) * 100;
  };

  // Function to handle logging out and uses the signOut function from firebase as a guard
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error.message);
    }
  };

  // Function to handle selecting a stock for other components
  const handleSelectStock = (stock) => {
    setSelectedStock(stock);
  };

  // Function to calculate the total balance of the user
  const calculateTotalBalance = () => {
    const currentValue = portfolio.reduce((sum, stock) => {
      return sum + stock.currentPrice * stock.quantity;
    }, 0);
    return userBalance + currentValue;
  };

  // Calculate the total balance
  const totalBalance = calculateTotalBalance();

  // Function to calculate the overall performance of the user
  const calculateOverallPerformance = () => {
    return ((totalBalance - 10000) / totalBalance) * 100;
  };

  // Calculate the overall performance
  const overallPerformance = calculateOverallPerformance();

  // Return the main page/view with all the neccessary components
  return (
    <div className="container">
      {/* Create the dashboard section */}
      <div className="left-bar">
        <img className="main-logo" src="/SproutLogo.png" alt="Sprout Logo" />
        <div className="account-value-box">
          <div className="account-value-left">
            <h4>Account Value: </h4>
            <div className="account-value">${totalBalance.toFixed(2)}</div>
          </div>
          <div className="account-value-right">
            <div className="percent">
              {overallPerformance.toFixed(2)}%
              <StraightIcon className="account-arrow" />
            </div>
          </div>
        </div>
        <Accordion
          classes={{ content: "custom-accordion" }}
          disableGutters={true}
          sx={{ boxShadow: "none" }}
          expanded={expanded === "panel1"}
          onChange={handleChange("panel1")}
        >
          <AccordionSummary
            classes={{ content: "custom-accordion-summary" }}
            sx={{ margin: 0 }}
            expandIcon={<ArrowForwardIosSharpIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <Typography>Portfolio</Typography>
          </AccordionSummary>
          <AccordionDetails classes={{ content: "custom-accordion-details" }}>
            {/* Render the Portfolio component */}
            <Portfolio
              stocks={stocks}
              portfolio={portfolio}
              handleSelectStock={setSelectedStock}
              selectedStock={selectedStock}
              handleBuyStock={handleBuyStock}
            handleSellStock={handleSellStock}
            />
          </AccordionDetails>
        </Accordion>
        <Accordion
          className="custom-accordion"
          disableGutters={true}
          sx={{ boxShadow: "none" }}
          expanded={expanded === "panel2"}
          onChange={handleChange("panel2")}
        >
          <AccordionSummary
            className="custom-accordion-summary"
            expandIcon={<ArrowForwardIosSharpIcon />}
            aria-controls="panel2-content"
            id="panel2-header"
          >
            {/* Render the Leaderboard component */}
            <Typography>Leaderboard</Typography>
          </AccordionSummary>
          <AccordionDetails className="custom-accordion-details">
            <Leaderboard />
          </AccordionDetails>
        </Accordion>
      </div>
      <div className="right-container">
        <div className="top-bar">
          {/* Render the Stock Search bar component */}
          <StockSearch
            stocks={stocks}
            setSelectedStock={setSelectedStock}
            selectedStock={selectedStock}
          />
          {/* Render the Profile component */}
          <ProfileDropdown username={username} handleLogout={handleLogout} />
        </div>
        {/* Render the Selected Stock component */}
        <SelectedStock
          selectedStock={selectedStock}
          handleBuyStock={handleBuyStock}
          handleSellStock={handleSellStock}
          handleAddToWishlist={handleAddToWishlist}
        />
        {/* Render the Wishlist component */}
        <Wishlist
          wishlist={wishlist}
          handleRemoveFromWishlist={handleRemoveFromWishlist}
          handleSelectStock={handleSelectStock}
          stocks={stocks}
          selectedStock={selectedStock}
        />
      </div>
    </div>
  );
}

export default MainPage;
