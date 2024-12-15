// Imports from react
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Imports from the material ui
import { TextField, Button, Typography, Box, Container } from "@mui/material";

// Imports from our firestore service and firebase
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase.js";
import { createUserWithBalance } from "../services/firestoreService.js";

// Our authentication page component
const AuthPage = () => {
  // useState hooks to manage the states of user authentication
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Function to handle the authentication
  const handleAuth = async () => {
    try {
      if (isSignUp) {
        if (!username) {
          setError("Username is required for sign-up.");
          return;
        }

        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Add user to Firestore with initial balance and username
        await createUserWithBalance(user.uid, user.email, username);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/app");
    } catch (err) {
      console.error("Error during authentication:", err.message);
      setError(err.message);
    }
  };

  // Function to handle the key press and check if it's the enter key
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleAuth();
    }
  };

  // Return the authentication page/view with all the neccessary components
  return (
    <div style={{ width: '100vw', height:'100vh'}}>
      <img
        className="logo"
        src="/SproutLogo.png"
        alt="Sprout Logo"
        style={{ display: "block", margin: "0 auto", maxWidth: "100px" }}
      />
      <Box display="flex" flexDirection="column" alignItems="center" mt={5} className="log-in-page">
        <Box className='log-in-box'>
        <Typography variant="h4" gutterBottom className="log-in-header" align="center">
          {isSignUp ? "Sign Up" : "Sign In"}
        </Typography>
        {isSignUp && ( // Only show username field for sign-up
              <TextField
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ marginBottom: "1rem" }}
              onKeyDown={handleKeyPress}
              className = 'log-in-field'
            />
        )}
        <TextField
          label="Email"
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: "1rem"}}
          onKeyDown={handleKeyPress}
          className = 'log-in-field'
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: "1rem" }}
          onKeyDown={handleKeyPress}
          className = 'log-in-field'
        />
        {error && (
          <Typography color="error" style={{ marginBottom: "1rem" }}>
            {error}
          </Typography>
        )}
        <Button
          className="log-in-button"
          variant="contained"
          onClick={handleAuth}
          style={{ marginBottom: "1rem", backgroundColor: "#14AE5C" }}
        >
          {isSignUp ? "Sign Up" : "Sign In"}
        </Button>
        </Box>
        <Button onClick={() => setIsSignUp((prev) => !prev)} style={{marginBottom:"10%"}}>
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </Button>
      </Box>
    </div>
  );
};

export default AuthPage;
